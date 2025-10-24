"use client";

import LogsTable from "@/app/admin/components/LogsTable";

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">บันทึกการใช้งาน</h1>
        <p className="mt-2 text-sm text-gray-600">
          ตรวจสอบการเปลี่ยนแปลงที่สำคัญทั้งหมดในระบบ กรองตามผู้ใช้, การดำเนินการ,
          หรือช่วงเวลาเพื่อตรวจสอบกิจกรรมได้อย่างรวดเร็ว
        </p>
      </div>
      <LogsTable />
    </div>
  );
}
