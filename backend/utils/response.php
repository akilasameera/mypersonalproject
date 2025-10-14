<?php
class ResponseHandler {
    public static function success($data = null, $message = null, $code = 200) {
        http_response_code($code);
        $response = ['success' => true];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        if ($message !== null) {
            $response['message'] = $message;
        }
        
        echo json_encode($response);
        exit();
    }
    
    public static function error($message, $code = 400, $details = null) {
        http_response_code($code);
        $response = [
            'success' => false,
            'error' => $message
        ];
        
        if ($details !== null) {
            $response['details'] = $details;
        }
        
        echo json_encode($response);
        exit();
    }
    
    public static function notFound($message = "Resource not found") {
        self::error($message, 404);
    }
    
    public static function unauthorized($message = "Unauthorized access") {
        self::error($message, 401);
    }
    
    public static function forbidden($message = "Access forbidden") {
        self::error($message, 403);
    }
    
    public static function validationError($errors) {
        self::error("Validation failed", 422, $errors);
    }
    
    public static function serverError($message = "Internal server error") {
        self::error($message, 500);
    }
}
?>