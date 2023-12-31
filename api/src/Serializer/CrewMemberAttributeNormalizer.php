<?php

namespace App\Serializer;

use App\Entity\CrewMember;
use App\Security\CrewMemberVoter;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class CrewMemberAttributeNormalizer implements NormalizerInterface, NormalizerAwareInterface
{
    use NormalizerAwareTrait;

    private const ALREADY_CALLED = 'CREW_MEMBER_ATTRIBUTE_NORMALIZER_ALREADY_CALLED';

    public function __construct(private readonly Security $security)
    {
    }

    public function normalize(mixed $object, $format = null, array $context = []): array|string|int|float|bool|\ArrayObject|null
    {
        if (isset($context['groups']) && !$this->security->isGranted(CrewMemberVoter::READ, $object)) {
            $context['groups'] = array_diff($context['groups'], [CrewMember::READ]);
        }

        $context[self::ALREADY_CALLED] = true;

        return $this->normalizer->normalize($object, $format, $context);
    }

    /**
     * @param array<string, mixed> $context
     */
    public function supportsNormalization(mixed $data, string $format = null, array $context = []): bool
    {
        if (isset($context[self::ALREADY_CALLED])) {
            return false;
        }

        return $data instanceof CrewMember;
    }

    /**
     * @return array<class-string|'*'|'object'|string, bool|null>
     */
    public function getSupportedTypes(): array
    {
        return [];
    }
}
