<?php

namespace App\Controller;

use App\Entity\Session;
use App\Repository\SessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

// AbstractController donne accès à $this->getUser(), $this->json(), etc.
// #[Route] sur la classe = préfixe commun à toutes les routes du controller
#[Route('/api/sessions')]
class SessionController extends AbstractController
{
    // GET /api/sessions
    // Retourne les sessions du user connecté, groupées par jour
    #[Route('', methods: ['GET'])]
    public function index(SessionRepository $repository): JsonResponse
    {
        // getUser() retourne le User depuis le JWT (grâce au firewall stateless)
        $user = $this->getUser();

        return $this->json(
            $repository->findByUserGroupedByDay($user)
        );
    }

    // POST /api/sessions
    // Crée une nouvelle session pour le user connecté
    #[Route('', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $session = new Session();
        $session->setUser($this->getUser()); // user_id toujours depuis le JWT
        $session->setDay($data['day'] ?? '');
        $session->setDiscipline($data['discipline'] ?? '');
        $session->setDescription($data['description'] ?? null);
        $session->setPosition($data['position'] ?? 0);

        // On valide les contraintes définies dans l'entité (#[Assert\...])
        $errors = $validator->validate($session);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $messages], Response::HTTP_BAD_REQUEST);
        }

        $em->persist($session);
        $em->flush();

        return $this->json([
            'id'          => $session->getId(),
            'discipline'  => $session->getDiscipline(),
            'description' => $session->getDescription(),
            'position'    => $session->getPosition(),
        ], Response::HTTP_CREATED);
    }

    // PATCH /api/sessions/{id}
    // Modifie une session existante (partiellement)
    #[Route('/{id}', methods: ['PATCH'])]
    public function update(
        Session $session, // Doctrine charge automatiquement la session via l'id dans l'URL
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        // Sécurité : on vérifie que la session appartient bien au user connecté
        if ($session->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès interdit'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        // PATCH = modification partielle, on ne change que les champs envoyés
        if (isset($data['day']))         $session->setDay($data['day']);
        if (isset($data['discipline']))  $session->setDiscipline($data['discipline']);
        if (isset($data['description'])) $session->setDescription($data['description']);
        if (isset($data['position']))    $session->setPosition($data['position']);

        $errors = $validator->validate($session);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $messages], Response::HTTP_BAD_REQUEST);
        }

        $em->flush();

        return $this->json([
            'id'          => $session->getId(),
            'day'         => $session->getDay(),
            'discipline'  => $session->getDiscipline(),
            'description' => $session->getDescription(),
            'position'    => $session->getPosition(),
        ]);
    }

    // DELETE /api/sessions/{id}
    // Supprime une session
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(
        Session $session,
        EntityManagerInterface $em
    ): JsonResponse {
        // Sécurité : même vérification que pour PATCH
        if ($session->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Accès interdit'], Response::HTTP_FORBIDDEN);
        }

        $em->remove($session);
        $em->flush();

        // 204 = No Content, succès sans body
        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
