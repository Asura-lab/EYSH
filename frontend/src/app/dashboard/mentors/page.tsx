"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import {
  Search,
  Filter,
  Star,
  MapPin,
  GraduationCap,
  MessageCircle,
  Calendar,
  Clock,
  ChevronRight,
  Heart,
  CheckCircle,
  Users,
} from "lucide-react";

interface Mentor {
  id: number;
  name: string;
  university: string;
  major: string;
  year: string;
  rating: number;
  reviews: number;
  subjects: string[];
  price: number;
  availability: string;
  bio: string;
  isOnline: boolean;
  isFavorite: boolean;
}

const mentors: Mentor[] = [
  {
    id: 1,
    name: "Баттулга Д.",
    university: "МУИС",
    major: "Компьютерийн ухаан",
    year: "4-р курс",
    rating: 4.9,
    reviews: 128,
    subjects: ["Математик", "Физик", "Програмчлал"],
    price: 25000,
    availability: "Өглөө, Орой",
    bio: "3 жилийн туршлагатай. 50+ сурагчид тусалсан. Элсэлтийн шалгалтанд 780+ оноо авсан.",
    isOnline: true,
    isFavorite: false,
  },
  {
    id: 2,
    name: "Сарангэрэл Б.",
    university: "ШУТИС",
    major: "Барилгын инженер",
    year: "3-р курс",
    rating: 4.8,
    reviews: 95,
    subjects: ["Математик", "Физик"],
    price: 20000,
    availability: "Өдөр",
    bio: "Математикийн олимпиадын хүрэл медальт. Тодорхой тайлбарлах чадвартай.",
    isOnline: false,
    isFavorite: true,
  },
  {
    id: 3,
    name: "Тэмүүжин О.",
    university: "Анагаахын их сургууль",
    major: "Эмчилгээ",
    year: "5-р курс",
    rating: 4.95,
    reviews: 156,
    subjects: ["Биологи", "Хими"],
    price: 30000,
    availability: "Орой",
    bio: "Анагаах ухааны элсэлтийн шалгалтанд бэлтгэх мэргэжилтэй. 95% нь элссэн.",
    isOnline: true,
    isFavorite: false,
  },
  {
    id: 4,
    name: "Номин Э.",
    university: "МУИС",
    major: "Эдийн засаг",
    year: "4-р курс",
    rating: 4.7,
    reviews: 72,
    subjects: ["Математик", "Англи хэл"],
    price: 22000,
    availability: "Уян хатан",
    bio: "TOEFL 110+, SAT Math 800 оноотой. Гадаадын их сургуульд бэлтгэхэд тусална.",
    isOnline: true,
    isFavorite: false,
  },
];

const subjects: string[] = ["Бүгд", "Математик", "Физик", "Хими", "Биологи", "Англи хэл", "Програмчлал"];

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Бүгд");
  const [favorites, setFavorites] = useState<number[]>([2]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === "Бүгд" || mentor.subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Менторууд</h1>
          <p className="text-gray-600 dark:text-gray-300">
            500+ туршлагатай ах эгч нараас өөрт тохирохыг олоорой
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Ментор эсвэл хичээл хайх..."
                leftIcon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
                    selectedSubject === subject
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-blue-100">Бүртгэлтэй ментор</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">95%</p>
                <p className="text-green-100">Сэтгэл ханамж</p>
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-purple-100">Дундаж үнэлгээ</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Mentor List */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} hover className="relative">
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(mentor.id)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.includes(mentor.id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-400"
                  }`}
                />
              </button>

              <div className="flex gap-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar size="xl" status={mentor.isOnline ? "online" : "offline"} />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{mentor.name}</h3>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm mt-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{mentor.university} • {mentor.major}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{mentor.year}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-gray-900 dark:text-white">{mentor.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">{mentor.reviews} үнэлгээ</span>
                  </div>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.subjects.map((subject) => (
                      <Badge key={subject} variant="info" size="sm">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{mentor.bio}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{mentor.availability}</span>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        ₮{mentor.price.toLocaleString()}/цаг
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" leftIcon={<MessageCircle className="w-4 h-4" />}>
                        Чат
                      </Button>
                      <Button size="sm" rightIcon={<Calendar className="w-4 h-4" />}>
                        Цаг авах
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Ментор олдсонгүй</h3>
            <p className="text-gray-600 dark:text-gray-300">Өөр хайлтын үг ашиглаж үзнэ үү</p>
          </div>
        )}
      </main>
    </div>
  );
}
