<?php

namespace App\Helper;

use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Contracts\Translation\TranslatorInterface;

final class ExceptionHelper
{
    public function __construct(private readonly TranslatorInterface $translator)
    {
    }

    /**
     * @param array<string, mixed> $parameters
     */
    public function createTranslatableHttpException(
        int $status,
        string $message,
        array $parameters = [],
        string $domain = 'exceptions'
    ): HttpException {
        $translatedMessage = $this->translator->trans($message, $parameters, $domain);

        return new HttpException($status, $translatedMessage);
    }
}
