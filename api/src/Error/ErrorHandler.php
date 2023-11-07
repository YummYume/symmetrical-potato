<?php

namespace App\Error;

use ApiPlatform\GraphQl\Error\ErrorHandlerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\HttpException;

final class ErrorHandler implements ErrorHandlerInterface
{
    public function __construct(
        private readonly ErrorHandlerInterface $defaultErrorHandler,
        private readonly LoggerInterface $logger
    ) {
    }

    /**
     * {@inheritdoc}
     */
    public function __invoke(array $errors, callable $formatter): array
    {
        foreach ($errors as $error) {
            $exception = $error->getPrevious();

            if ($exception instanceof HttpException) {
                $logMethod = $exception->getStatusCode() >= 500 ? 'critical' : 'info';

                $this->logger->$logMethod($exception);
            } else {
                $this->logger->critical($error);
            }
        }

        return ($this->defaultErrorHandler)($errors, $formatter);
    }
}
