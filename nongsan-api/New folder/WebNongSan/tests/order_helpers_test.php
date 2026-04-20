<?php

require_once __DIR__ . '/../utils/order_helpers.php';

$tests = [
    [
        'name' => 'fixed voucher below total',
        'voucher' => ['voucher_type' => 'fixed', 'voucher_value' => 25],
        'orderTotal' => 100,
        'expected' => 25.0,
    ],
    [
        'name' => 'fixed voucher capped by order total',
        'voucher' => ['voucher_type' => 'fixed', 'voucher_value' => 250],
        'orderTotal' => 120,
        'expected' => 120.0,
    ],
    [
        'name' => 'percent voucher calculates correctly',
        'voucher' => ['voucher_type' => 'percent', 'voucher_value' => 10],
        'orderTotal' => 399.99,
        'expected' => 40.0,
    ],
    [
        'name' => 'percent voucher respects max discount',
        'voucher' => ['voucher_type' => 'percent', 'voucher_value' => 25, 'max_discount_value' => 60],
        'orderTotal' => 400,
        'expected' => 60.0,
    ],
    [
        'name' => 'negative discount becomes zero',
        'voucher' => ['voucher_type' => 'fixed', 'voucher_value' => -15],
        'orderTotal' => 100,
        'expected' => 0.0,
    ],
    [
        'name' => 'missing voucher type defaults to fixed',
        'voucher' => ['voucher_value' => 18],
        'orderTotal' => 50,
        'expected' => 18.0,
    ],
];

$failures = [];

foreach ($tests as $test) {
    $actual = computePurchasedVoucherDiscountForOrder($test['voucher'], $test['orderTotal']);
    $expected = $test['expected'];

    if (abs($actual - $expected) > 0.01) {
        $failures[] = sprintf(
            '%s: expected %.2f, got %.2f',
            $test['name'],
            $expected,
            $actual
        );
    }
}

if ($failures !== []) {
    fwrite(STDERR, "Order helper tests failed:\n" . implode("\n", $failures) . "\n");
    exit(1);
}

echo 'Order helper tests passed: ' . count($tests) . "\n";