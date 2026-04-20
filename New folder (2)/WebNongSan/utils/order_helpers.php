<?php

if (!function_exists('computePurchasedVoucherDiscountForOrder')) {
    function computePurchasedVoucherDiscountForOrder($voucher, $orderTotal)
    {
        $isPercent = strtolower((string)($voucher['voucher_type'] ?? 'fixed')) === 'percent';
        $value = (float)($voucher['voucher_value'] ?? 0);
        $discount = $isPercent ? ($orderTotal * $value / 100) : $value;
        $maxDiscount = isset($voucher['max_discount_value']) && $voucher['max_discount_value'] !== null
            ? (float)$voucher['max_discount_value']
            : null;

        if ($maxDiscount !== null && $maxDiscount > 0 && $discount > $maxDiscount) {
            $discount = $maxDiscount;
        }

        if ($discount < 0) {
            $discount = 0;
        }

        if ($discount > $orderTotal) {
            $discount = $orderTotal;
        }

        return round($discount, 2);
    }
}