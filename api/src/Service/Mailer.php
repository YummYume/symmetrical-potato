<?php

namespace App\Service;

use App\Entity\Asset;
use App\Entity\ContractorRequest;
use App\Entity\Employee;
use App\Entity\Heist;
use App\Entity\HeistAsset;
use App\Entity\User;
use App\Enum\HeistCancellationReasonEnum;
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

    /**
     * Sends an email to the heist asset's owner to notify them of the asset's refund.
     */
    public function sendCrewMemberAssetRefundedEmail(HeistAsset $heistAsset): void
    {
        $crewMember = $heistAsset->getCrewMember();
        $user = $crewMember->getUser();
        $heist = $crewMember->getHeist();
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_NORMAL)
            ->subject($this->translator->trans('asset.crew_member_refunded.subject', [
                'asset' => $heistAsset->getAsset()->getName(),
            ], 'email', $user->getLocale()->value))
            ->text($this->translator->trans('asset.crew_member_refunded.text', [
                'name' => $user->getUsername(),
                'asset' => $heistAsset->getAsset()->getName(),
                'amount' => $heistAsset->getTotalSpent(),
                'heist' => $heist->getName(),
                'quantity' => $heistAsset->getQuantity(),
                'balance' => $user->getBalance(),
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/asset/crew_member_refunded.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'user' => $user,
                'heistAsset' => $heistAsset,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }

    /**
     * Sends an email to the contractor owning the heist's establishment to notify them of the asset's refund.
     */
    public function sendContractorAssetRefundedEmail(Asset $asset, float $totalAmount): void
    {
        $heist = $asset->getHeist();
        $user = $heist->getEstablishment()->getContractor();
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_NORMAL)
            ->subject($this->translator->trans('asset.contractor_refunded.subject', [
                'asset' => $asset->getName(),
            ], 'email', $user->getLocale()->value))
            ->text($this->translator->trans('asset.contractor_refunded.text', [
                'name' => $user->getUsername(),
                'asset' => $asset->getName(),
                'amount' => $totalAmount,
                'balance' => $user->getBalance(),
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/asset/contractor_refunded.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'user' => $user,
                'asset' => $asset,
                'totalAmount' => $totalAmount,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }

    /**
     * Sends an email to an admin to notify them of a new contractor request.
     */
    public function sendContractorRequestCreatedAdminEmail(ContractorRequest $contractorRequest, User $user): void
    {
        $url = sprintf('%s/admin/contractor_requests/%s', $this->siteBaseUrl, $contractorRequest->getId());
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_NORMAL)
            ->subject($this->translator->trans('contractor_request.created.subject', [], 'email', $user->getLocale()->value))
            ->text($this->translator->trans('contractor_request.created.text', [
                'name' => $user->getUsername(),
                'request_name' => $contractorRequest->getUser()->getUsername(),
                'reason' => $contractorRequest->getReason(),
                'url' => $url,
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/contractor_request/created.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'user' => $user,
                'contractorRequest' => $contractorRequest,
                'url' => $url,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }

    /**
     * Sends an email to the concerned user to notify them of their contractor request's acceptance.
     */
    public function sendContractorRequestAcceptedEmail(ContractorRequest $contractorRequest): void
    {
        $user = $contractorRequest->getUser();
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_HIGH)
            ->subject($this->translator->trans('contractor_request.accepted.subject', [], 'email', $user->getLocale()->value))
            ->text($this->translator->trans('contractor_request.accepted.text', [
                'name' => $user->getUsername(),
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/contractor_request/accepted.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'contractorRequest' => $contractorRequest,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }

    /**
     * Sends an email to the concerned user to notify them of their contractor request's refusal.
     */
    public function sendContractorRequestRefusedEmail(ContractorRequest $contractorRequest): void
    {
        $user = $contractorRequest->getUser();
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_HIGH)
            ->subject($this->translator->trans('contractor_request.refused.subject', [], 'email', $user->getLocale()->value))
            ->text($this->translator->trans('contractor_request.refused.text', [
                'name' => $user->getUsername(),
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/contractor_request/refused.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'contractorRequest' => $contractorRequest,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }

    /**
     * Sends an email to the contractor to notify them of a new employee request.
     */
    public function sendEmployeeCreatedContractorEmail(Employee $employee): void
    {
        $user = $employee->getUser();
        $contractor = $employee->getEstablishment()->getContractor();
        $url = sprintf('%s/employees/%s', $this->siteBaseUrl, $employee->getId());
        $email = (new TemplatedEmail())
            ->to($contractor->getEmail())
            ->priority(Email::PRIORITY_HIGH)
            ->subject($this->translator->trans('employee.created.subject', [], 'email', $contractor->getLocale()->value))
            ->text($this->translator->trans('employee.created.text', [
                'name' => $contractor->getUsername(),
                'employee' => $user->getUsername(),
                'motivation' => $employee->getMotivation(),
                'url' => $url,
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/employee/created.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'employee' => $employee,
                'url' => $url,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }

    /**
     * Sends an email to an employee to notify them of their acceptance.
     */
    public function sendEmployeeAcceptedEmail(Employee $employee): void
    {
        $user = $employee->getUser();
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_HIGH)
            ->subject($this->translator->trans('employee.accepted.subject', [], 'email', $user->getLocale()->value))
            ->text($this->translator->trans('employee.accepted.text', [
                'name' => $user->getUsername(),
                'code_name' => $employee->getCodeName(),
                'establishment' => $employee->getEstablishment()->getName(),
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/employee/accepted.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'employee' => $employee,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }

    /**
     * Sends an email to an employee to notify them of their refusal.
     */
    public function sendEmployeeRefusedEmail(Employee $employee): void
    {
        $user = $employee->getUser();
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_HIGH)
            ->subject($this->translator->trans('employee.refused.subject', [], 'email', $user->getLocale()->value))
            ->text($this->translator->trans('employee.refused.text', [
                'name' => $user->getUsername(),
                'establishment' => $employee->getEstablishment()->getName(),
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/employee/refused.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'employee' => $employee,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }

    /**
     * Sends an email to the concerned user to notify them of a heist's cancellation.
     * TODO : cancelled heists should refund the crew members and stuff (not to do here).
     * TODO : this email should also be sent when the heist is deleted manually.
     */
    public function sendHeistCancelledEmail(
        Heist $heist,
        User $user,
        HeistCancellationReasonEnum $cancellationReason = HeistCancellationReasonEnum::Manual
    ): void {
        $reason = $this->translator->trans(match ($cancellationReason) {
            HeistCancellationReasonEnum::NoCrewMember => 'heist.cancelled.reason.no_crew_member',
            HeistCancellationReasonEnum::NoEmployee => 'heist.cancelled.reason.no_employee',
            HeistCancellationReasonEnum::Manual => 'heist.cancelled.reason.manual',
        }, domain: 'email', locale: $user->getLocale()->value);
        $email = (new TemplatedEmail())
            ->to($user->getEmail())
            ->priority(Email::PRIORITY_HIGH)
            ->subject($this->translator->trans('heist.cancelled.subject', [], 'email', $user->getLocale()->value))
            ->text($this->translator->trans('heist.cancelled.text', [
                'name' => $user->getUsername(),
                'heist' => $heist->getName(),
                'reason' => $reason,
                'site' => $this->siteName,
            ], 'email', $user->getLocale()->value))
            ->htmlTemplate('email/heist/cancelled.html.twig')
            ->locale($user->getLocale()->value)
            ->context([
                'user' => $user,
                'heist' => $heist,
                'reason' => $reason,
                'site' => $this->siteName,
            ])
        ;

        $this->mailer->send($email);
    }
}