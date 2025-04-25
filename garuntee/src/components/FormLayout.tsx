// components/FormLayout.tsx
'use client'

import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'

export default function FormLayout() {
  const [formData, setFormData] = useState({
    idNumber: '',
    prefix: '',
    firstName: '',
    lastName: '',
    unit: '',
    officerType: '',
  })
  const [files, setFiles] = useState<FileList | null>(null)
  const [searchResult, setSearchResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpload = async () => {
    const { idNumber } = formData
    if (!files || !idNumber) {
      toast.warning("กรุณากรอกเลขบัตรและเลือกไฟล์")
      return
    }

    const uploadedList = []
    let hasError = false

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = `${idNumber}/${uuidv4()}_${file.name}`

      const { error } = await supabase.storage
        .from('attachments')
        .upload(path, file, { upsert: true })

      if (error) {
        toast.error(`❌ อัปโหลดไฟล์ ${file.name} ไม่สำเร็จ`)
        hasError = true
        continue
      }

      uploadedList.push({ name: file.name, type: file.type, path })
    }

    if (uploadedList.length > 0) {
      const { error } = await supabase
        .from('documents')
        .upsert({ ...formData, uploaded_files: uploadedList })

      if (!error) {
        toast.success(`✅ อัปโหลดไฟล์สำเร็จ ${uploadedList.length} ไฟล์`)
        setFormData({ idNumber: '', prefix: '', firstName: '', lastName: '', unit: '', officerType: '' })
        setFiles(null)
        fileInputRef.current!.value = ''
      } else {
        toast.error('❌ บันทึกข้อมูลไม่สำเร็จ')
      }
    }

    if (hasError && uploadedList.length === 0) {
      toast.error("❌ อัปโหลดล้มเหลวทั้งหมด")
    }
  }

  const handleSearch = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('idNumber', formData.idNumber)
      .single()
    if (data) {
      setSearchResult(data)
    } else {
      toast.warning('ไม่พบข้อมูล')
      setSearchResult(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📋 แบบฟอร์มขอรับรองเวลาราชการ</h1>
      <div className="grid grid-cols-2 gap-4">
        <input name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="เลขบัตรประชาชน" className="border p-2 rounded" />
        <select name="prefix" value={formData.prefix} onChange={handleChange} className="border p-2 rounded">
          <option value="">คำนำหน้า</option>
          <option value="นาย">นาย</option>
          <option value="นาง">นาง</option>
          <option value="นางสาว">นางสาว</option>
        </select>
        <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="ชื่อ" className="border p-2 rounded" />
        <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="นามสกุล" className="border p-2 rounded" />
        <input name="unit" value={formData.unit} onChange={handleChange} placeholder="หน่วยงาน" className="border p-2 rounded" />
        <select name="officerType" value={formData.officerType} onChange={handleChange} className="border p-2 rounded">
          <option value="">ประเภทข้าราชการ</option>
          <option value="ใน กห.">ใน กห.</option>
          <option value="นอก กห.">นอก กห.</option>
        </select>
        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} ref={fileInputRef} className="col-span-2 border p-2 rounded" />
      </div>

      <div className="flex gap-4 mt-4">
        <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">บันทึกข้อมูล</button>
        <button onClick={handleSearch} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">ค้นหา</button>
      </div>

      {searchResult?.uploaded_files && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">📄 เอกสารแนบ</h3>
          <table className="min-w-full border text-sm text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">ชื่อไฟล์</th>
                <th className="border px-4 py-2">ประเภท</th>
                <th className="border px-4 py-2">ดาวน์โหลด</th>
              </tr>
            </thead>
            <tbody>
              {searchResult.uploaded_files.map((file: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{file.name}</td>
                  <td className="border px-4 py-2">{file.type || '-'}</td>
                  <td className="border px-4 py-2">
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      ดาวน์โหลด
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
