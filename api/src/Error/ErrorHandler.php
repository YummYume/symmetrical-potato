<?php

namespace App\Error;

use ApiPlatform\GraphQl\Error\ErrorHandlerInterface;
use Psr\Log\LoggerInterface;

final class ErrorHandler implements ErrorHandlerInterface
{
    public function __construct(private ErrorHandlerInterface $defaultErrorHandler, private LoggerInterface $logger)
    {
    }

    /**
     * {@inheritdoc}
     */
    public function __invoke(array $errors, callable $formatter): array
    {

        $this->logger->error('GraphQL errors', $errors);

        return ($this->defaultErrorHandler)($errors, $formatter);
    }
}
