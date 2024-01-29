<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Contracts\Translation\TranslatorInterface;

final class Mailer
{
    public function __construct(private readonly MailerInterface $mailer, private readonly TranslatorInterface $translator)
    {
    }

    public function sendAccountValidatedEmail(User $user): void
    {
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_HIGH)
            ->subject($this->translator->trans('account.validated.subject', domain: 'email', locale: $user->getLocale()->value))
            ->text($this->translator->trans('account.validated.text', domain: 'email', locale: $user->getLocale()->value))
            ->htmlTemplate('email/account/validated.html.twig')
            ->context([
                'user' => $user,
            ])
        ;

        $this->mailer->send($email);
    }
}
