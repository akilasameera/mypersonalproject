<?php
class Validator {
    private $errors = [];
    
    public function required($value, $field) {
        if (empty($value) && $value !== '0') {
            $this->errors[$field] = ucfirst($field) . ' is required';
        }
        return $this;
    }
    
    public function email($value, $field) {
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = ucfirst($field) . ' must be a valid email address';
        }
        return $this;
    }
    
    public function minLength($value, $field, $min) {
        if (!empty($value) && strlen($value) < $min) {
            $this->errors[$field] = ucfirst($field) . " must be at least {$min} characters long";
        }
        return $this;
    }
    
    public function maxLength($value, $field, $max) {
        if (!empty($value) && strlen($value) > $max) {
            $this->errors[$field] = ucfirst($field) . " must not exceed {$max} characters";
        }
        return $this;
    }
    
    public function url($value, $field) {
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_URL)) {
            $this->errors[$field] = ucfirst($field) . ' must be a valid URL';
        }
        return $this;
    }
    
    public function date($value, $field) {
        if (!empty($value)) {
            $date = DateTime::createFromFormat('Y-m-d', $value);
            if (!$date || $date->format('Y-m-d') !== $value) {
                $this->errors[$field] = ucfirst($field) . ' must be a valid date (YYYY-MM-DD)';
            }
        }
        return $this;
    }
    
    public function in($value, $field, $allowed) {
        if (!empty($value) && !in_array($value, $allowed)) {
            $this->errors[$field] = ucfirst($field) . ' must be one of: ' . implode(', ', $allowed);
        }
        return $this;
    }
    
    public function numeric($value, $field) {
        if (!empty($value) && !is_numeric($value)) {
            $this->errors[$field] = ucfirst($field) . ' must be a number';
        }
        return $this;
    }
    
    public function boolean($value, $field) {
        if (!is_bool($value) && !in_array($value, [0, 1, '0', '1', 'true', 'false'], true)) {
            $this->errors[$field] = ucfirst($field) . ' must be a boolean value';
        }
        return $this;
    }
    
    public function hasErrors() {
        return !empty($this->errors);
    }
    
    public function getErrors() {
        return $this->errors;
    }
    
    public function getFirstError() {
        return !empty($this->errors) ? reset($this->errors) : null;
    }
    
    public static function validate($data, $rules) {
        $validator = new self();
        
        foreach ($rules as $field => $fieldRules) {
            $value = isset($data[$field]) ? $data[$field] : null;
            
            foreach ($fieldRules as $rule => $params) {
                if (is_numeric($rule)) {
                    // Simple rule without parameters
                    $rule = $params;
                    $params = [];
                } elseif (!is_array($params)) {
                    // Single parameter
                    $params = [$params];
                }
                
                switch ($rule) {
                    case 'required':
                        $validator->required($value, $field);
                        break;
                    case 'email':
                        $validator->email($value, $field);
                        break;
                    case 'min':
                        $validator->minLength($value, $field, $params[0]);
                        break;
                    case 'max':
                        $validator->maxLength($value, $field, $params[0]);
                        break;
                    case 'url':
                        $validator->url($value, $field);
                        break;
                    case 'date':
                        $validator->date($value, $field);
                        break;
                    case 'in':
                        $validator->in($value, $field, $params);
                        break;
                    case 'numeric':
                        $validator->numeric($value, $field);
                        break;
                    case 'boolean':
                        $validator->boolean($value, $field);
                        break;
                }
            }
        }
        
        return $validator;
    }
}
?>