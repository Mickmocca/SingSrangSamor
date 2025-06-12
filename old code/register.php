<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        // อ่านไฟล์ JSON
        $jsonFile = 'users.json';
        $jsonData = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) : ['users' => []];

        // รับค่าจากฟอร์ม
        $newUser = [
            'username' => $_POST['username'],
            'password' => password_hash($_POST['password'], PASSWORD_DEFAULT),
            'education_year' => $_POST['education-year'],
            'study_program' => $_POST['study-program'],
            'university' => $_POST['university'] ?? '',
            'faculty' => $_POST['faculty'] ?? '',
            'gpa' => $_POST['gpa'] ?? '',
            'admission_rounds' => isset($_POST['admission-round']) ? $_POST['admission-round'] : [],
            'created_at' => date('Y-m-d H:i:s')
        ];

        // ตรวจสอบ username ซ้ำ
        foreach ($jsonData['users'] as $user) {
            if ($user['username'] === $newUser['username']) {
                throw new Exception("ชื่อผู้ใช้นี้มีในระบบแล้ว");
            }
        }

        // เพิ่มผู้ใช้ใหม่
        $jsonData['users'][] = $newUser;

        // บันทึกไฟล์ JSON
        if (file_put_contents($jsonFile, json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            echo json_encode(['success' => true, 'message' => 'ลงทะเบียนสำเร็จ']);
        } else {
            throw new Exception("ไม่สามารถบันทึกข้อมูลได้");
        }

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?> 