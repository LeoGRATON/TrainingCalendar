<?php

namespace App\Entity;

// L'interface UserInterface est le contrat Symfony pour tout utilisateur
// Elle oblige à implémenter getRoles(), eraseCredentials(), getUserIdentifier()
use Symfony\Component\Security\Core\User\UserInterface;

// PasswordAuthenticatedUserInterface ajoute getPassword()
// Nécessaire pour que Symfony puisse hasher et vérifier les mots de passe
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use App\State\UserPasswordHasher; // le processor personnalisé pour hasher les mots de passe

#[ORM\Entity(repositoryClass: UserRepository::class)]
// On définit le nom de la table explicitement
#[ORM\Table(name: '`user`')]  // les backticks car "user" est un mot réservé en SQL
#[ApiResource(
    operations: [
        // POST /api/users → inscription (register)
        // On autorise sans être connecté (accès public)
        new Post(),
    ],
    // Groupes de sérialisation :
    // - user:write = champs acceptés en entrée (depuis le client)
    // - user:read  = champs retournés en sortie (vers le client)
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']],
    processor: UserPasswordHasher::class,
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    // On utilise UUID plutôt qu'un int auto-increment
    // Avantage : l'ID peut être généré côté client, pas de fuite d'info sur le volume de données
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['user:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    // On expose l'email en lecture ET on l'accepte en écriture (inscription)
    #[Groups(['user:read', 'user:write'])]
    private string $email = '';

    // Le mot de passe HASHÉ stocké en base
    // On ne l'expose JAMAIS en sortie (pas de groupe 'user:read')
    #[ORM\Column]
    private string $password = '';

    // Le mot de passe en CLAIR, reçu à l'inscription
    // "plainPassword" n'est PAS mappé en base (pas d'attribut #[ORM\Column])
    // Il sert uniquement à recevoir le mot de passe et le hasher avant sauvegarde
    #[Assert\NotBlank]
    #[Assert\Length(min: 6)]
    #[Groups(['user:write'])]
    private ?string $plainPassword = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['user:read', 'user:write'])]
    private string $firstName = '';

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank]
    #[Groups(['user:read', 'user:write'])]
    private string $lastName = '';

    #[ORM\Column]
    #[Groups(['user:read'])]
    private \DateTimeImmutable $createdAt;

    // Le constructeur initialise createdAt automatiquement à la création
    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    // --- Méthodes imposées par UserInterface ---

    // getUserIdentifier() retourne l'identifiant unique de l'utilisateur
    // C'est ce que Symfony utilise pour charger l'user depuis la base (via le provider)
    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    // getRoles() retourne les rôles de l'utilisateur
    // Symfony exige que ROLE_USER soit toujours présent
    public function getRoles(): array
    {
        // array_unique évite les doublons si on ajoute d'autres rôles plus tard
        return array_unique(['ROLE_USER']);
    }

    // eraseCredentials() est appelé par Symfony après authentification
    // On efface le mot de passe en clair de la mémoire par sécurité
    public function eraseCredentials(): void
    {
        $this->plainPassword = null;
    }

    // --- Méthode imposée par PasswordAuthenticatedUserInterface ---

    public function getPassword(): string
    {
        return $this->password;
    }

    // --- Getters / Setters standards ---

    public function getId(): ?Uuid { return $this->id; }

    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }

    public function setPassword(string $password): static { $this->password = $password; return $this; }

    public function getPlainPassword(): ?string { return $this->plainPassword; }
    public function setPlainPassword(?string $plainPassword): static { $this->plainPassword = $plainPassword; return $this; }

    public function getFirstName(): string { return $this->firstName; }
    public function setFirstName(string $firstName): static { $this->firstName = $firstName; return $this; }

    public function getLastName(): string { return $this->lastName; }
    public function setLastName(string $lastName): static { $this->lastName = $lastName; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
