'use client'

import { useState } from 'react'
import { X, FolderSync } from 'lucide-react'

interface JobModalProps {
  job?: any
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

export default function JobModal({ job, onClose, onSave }: JobModalProps) {
  const [form, setForm] = useState({
    name: job?.name ?? '',
    description: job?.description ?? '',
    sourcePath: job?.sourcePath ?? '',
    destPath: job?.destPath ?? '',
    schedule: job?.schedule ?? '',
    autoSync: job?.autoSync ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name || !form.sourcePath || !form.destPath) {
      setError('กรุณากรอกชื่องาน, path ต้นทาง, และ path ปลายทาง')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch (e: any) {
      setError(e.message || 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  const field = (
    label: string,
    key: keyof typeof form,
    placeholder: string,
    hint?: string,
    type = 'text'
  ) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-[#141720] border border-[#2a3045] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 mono"
      />
      {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e2435] border border-[#2a3045] rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a3045]">
          <div className="flex items-center gap-2.5">
            <FolderSync size={18} className="text-blue-400" />
            <h2 className="text-base font-semibold text-slate-100">
              {job ? 'แก้ไขงาน' : 'สร้างงานใหม่'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-[#2a3045]">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {field('ชื่องาน *', 'name', 'เช่น: Backup รายวัน')}
          {field('คำอธิบาย', 'description', 'รายละเอียดของงานนี้ (ไม่บังคับ)')}

          <div className="grid grid-cols-2 gap-3">
            {field('Path ต้นทาง *', 'sourcePath', '/source/folder', 'โฟลเดอร์ที่ต้องการซิงค์')}
            {field('Path ปลายทาง *', 'destPath', '/dest/folder', 'โฟลเดอร์เป้าหมาย')}
          </div>

          {field(
            'ตารางเวลา (Cron)',
            'schedule',
            '0 * * * * (ทุกชั่วโมง)',
            'รูปแบบ: นาที ชั่วโมง วัน เดือน วันในสัปดาห์ — ว่างคือไม่มีตาราง'
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, autoSync: !f.autoSync }))}
              className={`w-10 h-5.5 rounded-full transition-colors border relative ${
                form.autoSync ? 'bg-blue-600 border-blue-500' : 'bg-[#2a3045] border-[#3a4058]'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                form.autoSync ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
            <div>
              <span className="text-sm text-slate-200">ซิงค์อัตโนมัติ</span>
              <p className="text-xs text-slate-500">ตรวจสอบและอัพเดทไฟล์โดยอัตโนมัติเมื่อมีการเปลี่ยนแปลง</p>
            </div>
          </label>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#2a3045]">
          <button
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg hover:bg-[#2a3045] transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg transition-colors font-medium"
          >
            {saving ? 'กำลังบันทึก...' : job ? 'บันทึกการแก้ไข' : 'สร้างงาน'}
          </button>
        </div>
      </div>
    </div>
  )
}
