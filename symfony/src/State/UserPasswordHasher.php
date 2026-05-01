<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

// ProcessorInterface est le point d'entrée API Platform avant la sauvegarde
// On reçoit le User (déjà désérialisé et validé), on hashe le mdp, puis on passe au processor suivant
class UserPasswordHasher implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        // On injecte le processor "de base" qui va persister l'entité en base
        private readonly ProcessorInterface $processor,
        // Le service Symfony qui hash les mots de passe selon l'algo configuré
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        // Si ce n'est pas un User ou s'il n'y a pas de mot de passe en clair, on passe directement
        if (!$data instanceof User || !$data->getPlainPassword()) {
            return $this->processor->process($data, $operation, $uriVariables, $context);
        }

        // On hash le plainPassword et on stocke le résultat dans password
        $hashedPassword = $this->passwordHasher->hashPassword($data, $data->getPlainPassword());
        $data->setPassword($hashedPassword);

        // On délègue la sauvegarde au processor suivant (qui va faire persist + flush)
        return $this->processor->process($data, $operation, $uriVariables, $context);
    }
}
