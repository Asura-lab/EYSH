export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            EYSH
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Элсэлтийн Шалгалтанд Бэлдэх Систем
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4 text-blue-600 font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2">Түвшин Тодорхойлох</h3>
              <p className="text-gray-600 text-sm">
                AI-д суурилсан тест авч, өөрийн түвшинг мэдэх
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4 text-green-600 font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2">Хувийн Roadmap</h3>
              <p className="text-gray-600 text-sm">
                Танд зориулсан сургалтын төлөвлөгөө
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4 text-purple-600 font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2">Mentor Олох</h3>
              <p className="text-gray-600 text-sm">
                Дээд курсийн ах эгч нараас суралцах
              </p>
            </div>
          </div>

          <div className="mt-12 space-x-4">
            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition">
              Эхлэх
            </button>
            <button className="border border-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
              Дэлгэрэнгүй
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
