<?php

namespace App\Entity;

use App\Repository\SessionRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SessionRepository::class)]
class Session
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\Column(length: 3)]
    #[Assert\Choice(choices: ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'])]
    private string $day = '';

    // Enum stricte des disciplines
    #[ORM\Column(length: 10)]
    #[Assert\Choice(choices: ['swim', 'bike', 'run', 'gym', 'rest'])]
    private string $discipline = '';

    // Description optionnelle, max 500 caractères
    #[ORM\Column(type: 'text', nullable: true)]
    #[Assert\Length(max: 500)]
    private ?string $description = null;

    // Position pour l'ordre dans un jour (prévu pour le drag-and-drop plus tard)
    #[ORM\Column]
    #[Assert\GreaterThanOrEqual(0)]
    private int $position = 0;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    // --- Getters / Setters ---

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getDay(): string { return $this->day; }
    public function setDay(string $day): static { $this->day = $day; return $this; }

    public function getDiscipline(): string { return $this->discipline; }
    public function setDiscipline(string $discipline): static { $this->discipline = $discipline; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }

    public function getPosition(): int { return $this->position; }
    public function setPosition(int $position): static { $this->position = $position; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}