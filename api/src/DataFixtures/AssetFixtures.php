<?php

namespace App\DataFixtures;

use App\Entity\Asset;
use App\Enum\AssetTypeEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

final class AssetFixtures extends Fixture
{
    // Global Assets
    public const GLOBAL_ASSET_MEDIC_BAG = 'medic_bag';
    public const GLOBAL_ASSET_AMMO_BAG = 'ammo_bag';
    public const GLOBAL_ASSET_ARMOR_BAG = 'armor_bag';
    public const GLOBAL_ASSET_ZIP_LINE = 'zip_line';
    public const GLOBAL_ASSET_BLUE_KEYCARD = 'blue_keycard';
    public const GLOBAL_ASSET_RED_KEYCARD = 'red_keycard';

    // Global Equipment
    public const GLOBAL_EQUIPMENT_STANDARD_LINING = 'standard_lining';
    public const GLOBAL_EQUIPMENT_LIGHT_BALLISTIC_LINING = 'light_ballistic_lining';
    public const GLOBAL_EQUIPMENT_MEDIUM_BALLISTIC_LINING = 'medium_ballistic_lining';
    public const GLOBAL_EQUIPMENT_HEAVY_BALLISTIC_LINING = 'heavy_ballistic_lining';
    public const GLOBAL_EQUIPMENT_FRAG_GRENADE = 'frag_grenade';
    public const GLOBAL_EQUIPMENT_FLASHBANG_GRENADE = 'flashbang_grenade';
    public const GLOBAL_EQUIPMENT_SMOKE_GRENADE = 'smoke_grenade';
    public const GLOBAL_EQUIPMENT_THROWING_KNIFE = 'throwing_knife';
    public const GLOBAL_EQUIPMENT_ECM_JAMMER = 'ecm_jammer';
    public const GLOBAL_EQUIPMENT_MICROCAM = 'microcam';
    public const GLOBAL_EQUIPMENT_INFRASONIC_MINE = 'infrasonic_mine';
    public const GLOBAL_EQUIPMENT_MOTION_SENSOR = 'motion_sensor';

    // Global Weapons
    public const GLOBAL_WEAPON_MARCOM_MAMBA_MGL = 'marcom_mamba_mgl';
    public const GLOBAL_WEAPON_HET5_RED_FOX = 'het5_red_fox';

    public const REFERENCE_IDENTIFIER = 'asset_';
    public const DATA = [
        // Global Assets
        self::GLOBAL_ASSET_MEDIC_BAG => [
            'name' => 'Medic Bag',
            'price' => 10000,
            'type' => AssetTypeEnum::Asset,
            'description' => 'A medic bag to heal yourself or your teammates.',
            'maxQuantity' => 1,
            'teamAsset' => true,
        ],
        self::GLOBAL_ASSET_AMMO_BAG => [
            'name' => 'Ammo Bag',
            'price' => 10000,
            'type' => AssetTypeEnum::Asset,
            'description' => 'An ammo bag to refill your ammo.',
            'maxQuantity' => 1,
            'teamAsset' => true,
        ],
        self::GLOBAL_ASSET_ARMOR_BAG => [
            'name' => 'Armor Bag',
            'price' => 10000,
            'type' => AssetTypeEnum::Asset,
            'description' => 'An armor bag to refill your armor.',
            'maxQuantity' => 1,
            'teamAsset' => true,
        ],
        self::GLOBAL_ASSET_ZIP_LINE => [
            'name' => 'Zip Line',
            'price' => 10000,
            'type' => AssetTypeEnum::Asset,
            'description' => 'A zip line to move faster.',
            'maxQuantity' => 1,
            'teamAsset' => true,
        ],
        self::GLOBAL_ASSET_BLUE_KEYCARD => [
            'name' => 'Blue Keycard',
            'price' => 20000,
            'type' => AssetTypeEnum::Asset,
            'description' => 'A blue keycard to open the camera room.',
            'maxQuantity' => 1,
            'teamAsset' => true,
        ],
        self::GLOBAL_ASSET_RED_KEYCARD => [
            'name' => 'Red Keycard',
            'price' => 20000,
            'type' => AssetTypeEnum::Asset,
            'description' => 'A red keycard to open restricted doors.',
            'maxQuantity' => 1,
            'teamAsset' => true,
        ],
        // Global equipment
        self::GLOBAL_EQUIPMENT_STANDARD_LINING => [
            'name' => 'Standard Lining',
            'price' => 10000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A standard lining to move faster. Provides minimal protection.',
            'maxQuantity' => 1,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_LIGHT_BALLISTIC_LINING => [
            'name' => 'Light Ballistic Lining',
            'price' => 20000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A light ballistic that provides good balance between protection and speed.',
            'maxQuantity' => 1,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_MEDIUM_BALLISTIC_LINING => [
            'name' => 'Medium Ballistic Lining',
            'price' => 30000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A medium ballistic that provides good protection but slows you down.',
            'maxQuantity' => 1,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_HEAVY_BALLISTIC_LINING => [
            'name' => 'Heavy Ballistic Lining',
            'price' => 40000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A heavy ballistic that provides the best protection but slows you down heavily.',
            'maxQuantity' => 1,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_FRAG_GRENADE => [
            'name' => 'Frag Grenade',
            'price' => 10000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A frag grenade that deals damage to enemies.',
            'maxQuantity' => 3,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_FLASHBANG_GRENADE => [
            'name' => 'Flashbang Grenade',
            'price' => 10000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A flashbang grenade that blinds enemies.',
            'maxQuantity' => 3,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_SMOKE_GRENADE => [
            'name' => 'Smoke Grenade',
            'price' => 10000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A smoke grenade that creates a smoke screen.',
            'maxQuantity' => 3,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_THROWING_KNIFE => [
            'name' => 'Throwing Knife',
            'price' => 10000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A throwing knife that deals damage to enemies.',
            'maxQuantity' => 3,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_ECM_JAMMER => [
            'name' => 'ECM Jammer',
            'price' => 10000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'An ECM jammer that slows cameras and radios.',
            'maxQuantity' => 1,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_MICROCAM => [
            'name' => 'Microcam',
            'price' => 10000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A microcam that you can place anywhere.',
            'maxQuantity' => 2,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_INFRASONIC_MINE => [
            'name' => 'Infrasonic Mine',
            'price' => 10000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'An infrasonic mine that can stun enemies.',
            'maxQuantity' => 5,
            'teamAsset' => false,
        ],
        self::GLOBAL_EQUIPMENT_MOTION_SENSOR => [
            'name' => 'Motion Sensor',
            'price' => 10000,
            'type' => AssetTypeEnum::Equipment,
            'description' => 'A motion sensor that detects any movement.',
            'maxQuantity' => 2,
            'teamAsset' => false,
        ],
        // Global Weapons
        self::GLOBAL_WEAPON_MARCOM_MAMBA_MGL => [
            'name' => 'Marcom Mamba MGL',
            'price' => 50000,
            'type' => AssetTypeEnum::Weapon,
            'description' => 'A powerful grenade launcher that deals damage to enemies, but also to yourself.',
            'maxQuantity' => 2,
            'teamAsset' => false,
        ],
        self::GLOBAL_WEAPON_HET5_RED_FOX => [
            'name' => 'HET5 Red Fox',
            'price' => 50000,
            'type' => AssetTypeEnum::Weapon,
            'description' => 'End the war before it starts. This sniper can spot any enemy, anywhere.',
            'maxQuantity' => 2,
            'teamAsset' => false,
        ],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach (self::DATA as $key => $asset) {
            $newAsset = (new Asset())
                ->setName($asset['name'])
                ->setPrice($asset['price'])
                ->setType($asset['type'])
                ->setDescription($asset['description'] ?? null)
                ->setMaxQuantity($asset['maxQuantity'] ?? 1)
                ->setTeamAsset($asset['teamAsset'] ?? false)
            ;

            $manager->persist($newAsset);
            $this->addReference(self::REFERENCE_IDENTIFIER.$key, $newAsset);
        }

        $manager->flush();
    }
}
