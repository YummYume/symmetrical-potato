<?php

namespace App\Tests\Helper;

use App\Helper\ExceptionHelper;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpKernel\Exception\HttpException;

final class ExceptionHelperTest extends KernelTestCase
{
    private readonly ExceptionHelper $exceptionHelper;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->exceptionHelper = static::getContainer()->get(ExceptionHelper::class);
    }

    public function testTranslatableHttpException(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('The requested resource was not found.');

        throw $this->exceptionHelper->createTranslatableHttpException(404, 'common.not_found');
    }

    public function testUntranslatableHttpException(): void
    {
        $message = 'This message does not exist in the translation files.';

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage($message);

        throw $this->exceptionHelper->createTranslatableHttpException(404, $message);
    }
}
