<?php

namespace App\Repository;

use App\Entity\Session;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Session::class);
    }

    // Récupère toutes les sessions d'un user, triées par jour puis par position
    // On utilise cette méthode dans le controller pour construire la réponse groupée
    public function findByUserGroupedByDay(User $user): array
    {
        // On initialise les 7 jours avec des tableaux vides
        // Comme ça la réponse contiendra toujours tous les jours, même sans séance
        $grouped = [
            'lun' => [], 'mar' => [], 'mer' => [],
            'jeu' => [], 'ven' => [], 'sam' => [], 'dim' => [],
        ];

        // On récupère toutes les sessions du user triées par position
        $sessions = $this->createQueryBuilder('s')
            ->where('s.user = :user')
            ->setParameter('user', $user)
            ->orderBy('s.position', 'ASC')
            ->getQuery()
            ->getResult();

        // On range chaque session dans le bon jour
        foreach ($sessions as $session) {
            $grouped[$session->getDay()][] = [
                'id'          => $session->getId(),
                'day'         => $session->getDay(),
                'discipline'  => $session->getDiscipline(),
                'description' => $session->getDescription(),
                'position'    => $session->getPosition(),
            ];
        }

        return $grouped;
    }
}