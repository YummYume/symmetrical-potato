<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Contracts\Translation\TranslatorInterface;

final class Mailer
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly TranslatorInterface $translator,
        private readonly string $siteName,
        private readonly string $siteBaseUrl
    ) {
    }

    /**
     * Sends an email to the given user to notify them of their account's validation.
     */
    public function sendAccountValidatedEmail(User $user): void
    {
        $url = sprintf('%s/login', $this->siteBaseUrl);
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_HIGH)
            ->subject($this->translator->trans('account.validated.subject', domain: 'email', locale: $user->getLocale()->value))
            ->text($this->translator->trans('account.validated.text', [
                'name' => $user->getUsername(),
                'url' => $url,
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/account/validated.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'user' => $user,
                'url' => $url,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }
}
