"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

type PolicyType = "terms" | "privacy";

export default function PolicyModal({
  open,
  onClose,
  type,
}: {
  open: boolean;
  onClose: () => void;
  type: PolicyType;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [open, onClose]);

  // Display title (static Thai text)
  const displayTitle = type === "terms" ? "ข้อกำหนดการใช้งาน" : "นโยบายความเป็นส่วนตัว";

  const title = type === "terms" ? "ข้อกำหนดการใช้งาน" : "นโยบายความเป็นส่วนตัว";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 18, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-[1] w-[92vw] max-w-2xl rounded-2xl bg-white p-5 md:p-6 shadow-xl border border-neutral-200/70"
          >
            <header className="mb-3 flex items-start justify-between gap-4">
              <h3 className="text-xl md:text-2xl font-extrabold text-neutral-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="ปิด"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className="max-h-[70vh] overflow-y-auto pr-1 text-[15px] leading-7 text-neutral-800">
              {type === "terms" ? <TermsContent /> : <PrivacyContent />}
              <p className="mt-4 text-xs text-neutral-500">อัปเดตล่าสุด: กันยายน 2568</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-semibold hover:bg-neutral-800"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TermsContent() {
  return (
    <div className="space-y-3">
      <p>
        เว็บไซต์นี้เป็นส่วนหนึ่งของโปรเจกต์วิชามหาวิทยาลัย จัดทำขึ้นเพื่อการศึกษาและสาธิตเท่านั้น
        ไม่มีวัตถุประสงค์ทางการค้า และไม่ได้เกี่ยวข้องกับแบรนด์ ร้านค้า หรือผู้ให้บริการใด ๆ อย่างเป็นทางการ
        คำสั่งซื้อ การชำระเงิน และข้อมูลที่ปรากฏบนระบบเป็นข้อมูลสาธิตเท่านั้น
      </p>
      <p>
        โดยการใช้งานเว็บไซต์ คุณยอมรับว่าจะใช้งานอย่างเหมาะสมและไม่ฝ่าฝืนกฎหมาย เช่น การส่งสแปม การโจมตีระบบ
        การละเมิดลิขสิทธิ์ หรือการกระทำที่ก่อให้เกิดความเสียหายต่อผู้อื่น เราอาจระงับหรือปิดกั้นการใช้งานได้
        หากพบการใช้งานที่ไม่เหมาะสม
      </p>
      <p>
        บัญชีผู้ใช้: คุณต้องกรอกข้อมูลที่ถูกต้องและเป็นปัจจุบัน และรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นบนบัญชีของคุณ
        หากพบความผิดปกติ โปรดแจ้งทีมพัฒนาโดยเร็ว
      </p>
      <p>
        การสั่งซื้อและการชำระเงิน: ฟีเจอร์ที่เกี่ยวข้องเป็นการจำลอง ไม่มีการเรียกเก็บเงินจริง ไม่มีการจัดส่งสินค้า
        และข้อมูลธุรกรรมทั้งหมดเป็นข้อมูลตัวอย่างเพื่อการนำเสนอเท่านั้น
      </p>
      <p>
        ทรัพย์สินทางปัญญา: สื่อ เนื้อหา และโลโก้ต่าง ๆ ที่ใช้เพื่อประกอบการเรียนรู้ อาจเป็นลิขสิทธิ์ของเจ้าของเดิม
        และถูกใช้งานเพื่อวัตถุประสงค์ทางการศึกษา หากมีส่วนใดละเมิดสิทธิ์ โปรดติดต่อเพื่อให้ปรับแก้หรือนำออก
      </p>
      <p>
        การจำกัดความรับผิด: โครงการนี้จัดทำในสภาพแวดล้อมสาธิต “ตามสภาพที่เป็น” เราไม่รับประกันความถูกต้องครบถ้วน
        หรือความพร้อมใช้งานของระบบ และไม่รับผิดต่อความเสียหายใด ๆ ที่อาจเกิดขึ้นจากการใช้งานเว็บไซต์นี้
      </p>
      <p>
        การเปลี่ยนแปลงข้อตกลง: เราอาจปรับปรุงเงื่อนไขได้เป็นครั้งคราว และจะแสดงวันที่อัปเดตล่าสุดไว้ท้ายเอกสารนี้
      </p>
      <p>
        ช่องทางติดต่อ: โปรดติดต่อทีมพัฒนาผ่านอีเมลตัวอย่างที่ <span className="font-medium">tanapat.works@gmail.com</span>
        เพื่อข้อเสนอแนะหรือคำร้องเรียน
      </p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-3">
      <p>
        เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ ข้อความนี้อธิบายข้อมูลที่อาจถูกเก็บ ใช้ และปกป้องในเว็บไซต์สาธิตนี้
        ซึ่งพัฒนาสำหรับรายวิชามหาวิทยาลัยเท่านั้น
      </p>
      <p>
        ข้อมูลที่เก็บ: ชื่อ–นามสกุล เบอร์โทรศัพท์ อีเมล วันเกิด และข้อมูลการใช้งานทั่วไปเพื่อทำงานฟีเจอร์สมัครสมาชิก/เข้าสู่ระบบ
        ข้อมูลบางส่วนอาจถูกบันทึกไว้ในอุปกรณ์ของคุณผ่าน localStorage/คุกกี้เพื่อความสะดวกในการใช้งานครั้งถัดไป
      </p>
      <p>
        วัตถุประสงค์ในการใช้ข้อมูล: เพื่อให้บริการฟังก์ชันของระบบ ติดต่อกลับเมื่อจำเป็น และเพื่อสถิติการใช้งานแบบรวม
        เราไม่จำหน่ายข้อมูลส่วนบุคคลและจะไม่ใช้ในเชิงพาณิชย์
      </p>
      <p>
        การจัดเก็บและระยะเวลา: ข้อมูลจะถูกเก็บเท่าที่จำเป็นต่อวัตถุประสงค์การเรียนรู้ และอาจถูกลบหลังสิ้นสุดการนำเสนอ/ภาคการศึกษา
        คุณสามารถลบข้อมูลได้ด้วยการล้างข้อมูลเว็บไซต์ในเบราว์เซอร์ของคุณ
      </p>
      <p>
        ความปลอดภัย: เราพยายามปกป้องข้อมูลตามความเหมาะสมของโครงการศึกษา อย่างไรก็ตาม ไม่สามารถรับประกันความปลอดภัยได้ 100%
        โปรดหลีกเลี่ยงการกรอกข้อมูลอ่อนไหว เช่น เลขบัตรประชาชนหรือข้อมูลการชำระเงินจริง
      </p>
      <p>
        สิทธิของเจ้าของข้อมูล: คุณมีสิทธิ์เข้าถึง แก้ไข และขอลบข้อมูลของคุณ หากมีคำขอ โปรดติดต่อทีมพัฒนาที่
        <span className="font-medium"> student@example.edu</span>
      </p>
      <p>
        การปรับปรุงนโยบาย: เรายังคงปรับปรุงให้ดีขึ้นและจะแสดงวันที่อัปเดตไว้อย่างชัดเจน
      </p>
    </div>
  );
}
