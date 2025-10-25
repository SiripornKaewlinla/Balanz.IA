// CategoryPopup.js

import { useState } from "react";

export default function CategoryPopup({ categories, formData, selectCategory, deleteCategory, setShowAddCategoryModal }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isManaging, setIsManaging] = useState(false); 

  // Filter categories to only show the ones matching the current type (income/expense)
  const filteredCategories = categories.filter(cat => cat.type === formData.type);
  const selectedCategory = categories.find(cat => cat._id === formData.category);

  // ฟังก์ชันสลับโหมดจัดการ
  const toggleManaging = (e) => {
    e.stopPropagation();
    setIsManaging(prev => !prev);
  }

  return (
    <div>
      <div className="flex items-center space-x-2">
        {/* Button to open the Category Selection Modal */}
        <button
          type="button"
          onClick={() => setShowPopup(true)}
          className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-1 shadow-md"
        >
          {selectedCategory ? `เลือกหมวดหมู่ (${selectedCategory.icon} ${selectedCategory.name})` : 'เลือกหมวดหมู่'}
        </button>

        {/* Button to open the Add New Category Modal directly (Optional but kept for quick access) */}
        {/* <button
            type="button"
            onClick={() => setShowAddCategoryModal(true)}
            className="mt-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xl font-medium shadow-md"
            title="เพิ่มหมวดหมู่ใหม่"
        >
            +
        </button> */}
      </div>

      {!formData.category || !selectedCategory ? (
          <p className="mt-2 text-sm text-red-500">
              ⚠️ โปรดเลือกหมวดหมู่สำหรับประเภท**{formData.type === 'income' ? 'รายรับ' : 'รายจ่าย'}**
          </p>
      ) : (
          <p className="mt-2 text-sm text-gray-600">
              หมวดหมู่ปัจจุบัน: **{selectedCategory.icon} {selectedCategory.name}**
          </p>
      )}


      {/* Category Selection Popup/Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/70 z-50 p-4" style={{ fontFamily: 'Noto Sans Thai, sans-serif' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 h-[90vh] flex flex-col transform transition-all duration-300 scale-95 md:scale-100">
            
            {/* Header Area */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  เลือกหมวดหมู่ ({formData.type === 'income' ? 'รายรับ' : 'รายจ่าย'})
                </h2>
                <div className="flex space-x-3">
                    {/* ปุ่ม เพิ่มใหม่ */}
                    <button
                        type="button"
                        onClick={() => {
                            setShowPopup(false);
                            setShowAddCategoryModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center text-sm font-medium shadow-md"
                    >
                        + เพิ่มใหม่
                    </button>
                    {/* ปุ่ม จัดการหมวดหมู่ */}
                    <button
                        type="button"
                        onClick={toggleManaging}
                        className={`px-4 py-2 rounded-xl transition-colors flex items-center text-sm font-medium ${
                            isManaging ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {isManaging ? 'ยกเลิกการจัดการ' : 'จัดการหมวดหมู่'}
                    </button>
                </div>
            </div>
            {/* End Header Area */}

            {/* Grid for Categories (Scrollable) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 overflow-y-auto pb-4 flex-grow">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className={`
                        bg-white border rounded-xl p-5 flex-shrink-0 transition-all duration-200 shadow-lg 
                        flex flex-col items-center justify-between space-y-3 cursor-pointer h-36
                        ${isManaging ? 'border-dashed border-2 border-gray-400 hover:bg-red-50/50' : ''}
                        ${
                            formData.category === cat._id && !isManaging 
                            ? "border-green-600 bg-green-50 ring-4 ring-green-300 transform scale-105" 
                            : "border-gray-100 hover:shadow-xl hover:border-green-300"
                        }
                    `}
                    onClick={() => {
                        if (!isManaging) { // อนุญาตให้เลือกหมวดหมู่ได้เมื่อไม่อยู่ในโหมดจัดการ
                            selectCategory(cat._id);
                            setShowPopup(false);
                        }
                    }}
                  >
                    <div className="w-full text-center text-gray-800 font-medium flex flex-col items-center flex-grow justify-center">
                      <span className={`text-4xl ${formData.category === cat._id && !isManaging ? 'text-green-700' : 'text-gray-600'}`}>{cat.icon}</span>
                      <span className="text-sm font-semibold truncate mt-2 text-gray-700">{cat.name}</span>
                    </div>

                    {/* ปุ่มลบ จะแสดงเมื่ออยู่ในโหมดจัดการเท่านั้น */}
                    {isManaging && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent selection/modal from closing
                            deleteCategory(cat._id);
                          }}
                          className="w-full bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors text-xs font-bold shadow-md"
                        >
                          ลบ
                        </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="col-span-6 text-center text-gray-500 mt-5 p-8 border-2 border-dashed rounded-xl">
                    ไม่พบหมวดหมู่สำหรับประเภทนี้ โปรดคลิก **"เพิ่มใหม่"**
                </p>
              )}
            </div>

            {/* Footer buttons */}
            <div className="mt-6 flex justify-end border-t pt-4">
              <button
                onClick={() => {
                    setShowPopup(false);
                    setIsManaging(false); // ออกจากโหมดจัดการเมื่อปิด
                }}
                className="px-6 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition-colors font-medium text-gray-800 shadow-md"
              >
                {isManaging ? 'เสร็จสิ้นการจัดการ' : 'ปิด'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}