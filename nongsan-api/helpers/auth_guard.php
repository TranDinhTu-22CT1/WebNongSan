<?php

include_once __DIR__ . '/../utils/jwt_helper.php';

function auth_get_bearer_token() {
    $authHeader = '';
    $fallbackToken = '';

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = (string)$headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $authHeader = (string)$headers['authorization'];
        }

        // Fallback for environments that strip Authorization but allow custom headers.
        if (isset($headers['X-Access-Token'])) {
            $fallbackToken = (string)$headers['X-Access-Token'];
        } elseif (isset($headers['x-access-token'])) {
            $fallbackToken = (string)$headers['x-access-token'];
        }
    }

    if ($authHeader === '' && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = (string)$_SERVER['HTTP_AUTHORIZATION'];
    }

    if ($authHeader === '' && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = (string)$_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if ($fallbackToken === '' && isset($_SERVER['HTTP_X_ACCESS_TOKEN'])) {
        $fallbackToken = (string)$_SERVER['HTTP_X_ACCESS_TOKEN'];
    }

    if ($authHeader === '' && $fallbackToken !== '') {
        return trim($fallbackToken);
    }

    // Last-resort fallback for JSON POST bodies that include a token field.
    if ($authHeader === '' && in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        $rawBody = file_get_contents('php://input');
        if ($rawBody !== false && $rawBody !== '') {
            $jsonBody = json_decode($rawBody, true);
            if (is_array($jsonBody) && !empty($jsonBody['token'])) {
                return trim((string)$jsonBody['token']);
            }
        }
    }

    return trim((string)preg_replace('/^Bearer\s+/i', '', $authHeader));
}

function require_auth(array $allowedRoles = []) {
    $token = auth_get_bearer_token();

    if ($token === '') {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $user = JWT_Helper::validate($token);
    if (!$user || empty($user->id)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }

    $exp = isset($user->exp) ? (int)$user->exp : 0;
    if ($exp > 0 && time() > $exp) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Token expired']);
        exit;
    }

    if (!empty($allowedRoles)) {
        $role = strtolower(trim((string)($user->role ?? '')));
        $normalizedAllowedRoles = array_map(function ($item) {
            return strtolower(trim((string)$item));
        }, $allowedRoles);

        if (!in_array($role, $normalizedAllowedRoles, true)) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
            exit;
        }
    }

    return $user;
}
