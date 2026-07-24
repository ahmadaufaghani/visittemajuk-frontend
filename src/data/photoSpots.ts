export interface PhotoSpot {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  category: string;
  location: string;
  bestTime: string;
  tips: string[];
  gallery: string[];
  nearbyAttractions: string[];
}

export const photoSpots: PhotoSpot[] = [
  {
    id: "sunset-point",
    title: "Sunset Point Temajuk",
    description: "Titik ideal untuk menikmati dan mengabadikan keindahan matahari terbenam dengan latar belakang laut Natuna.",
    fullDescription: "Sunset Point Temajuk adalah spot terbaik untuk menikmati keindahan matahari terbenam di Temajuk. Terletak di bagian barat pantai, tempat ini menawarkan pemandangan spektakuler saat matahari tenggelam di ufuk Laut Natuna, menciptakan gradasi warna orange, merah, dan ungu yang memukau. Selain untuk foto, spot ini juga cocok untuk bersantai dan menikmati momen tenang di akhir hari. Beberapa formasi batu dan pohon kelapa di sekitar lokasi dapat menjadi elemen menarik untuk komposisi foto Anda.",
    imageUrl: "https://images.pexels.com/photos/635279/pexels-photo-635279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Pantai",
    location: "Bagian Barat Pantai Temajuk, Desa Temajuk, Kecamatan Paloh, Kabupaten Sambas",
    bestTime: "16.00 - 18.30 WIB",
    tips: [
      "Datang 1 jam sebelum sunset untuk mendapatkan posisi terbaik",
      "Bawa tripod untuk hasil foto yang lebih stabil",
      "Gunakan filter ND untuk hasil foto sunset yang lebih dramatis",
      "Sediakan jaket tipis karena angin pantai bisa cukup kencang saat sore hari"
    ],
    gallery: [
      "https://images.pexels.com/photos/3310691/pexels-photo-3310691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/33545/sunrise-phu-quoc-island-ocean.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1705254/pexels-photo-1705254.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    nearbyAttractions: [
      "Pantai Temajuk",
      "Warung Seafood Pak Rahman",
      "Kedai Kopi Ujung Negeri"
    ]
  },
  {
    id: "mangrove-view",
    title: "Mangrove View Deck",
    description: "Deck kayu di tengah hutan mangrove dengan pemandangan matahari terbit yang menakjubkan dan suasana alam yang tenang.",
    fullDescription: "Mangrove View Deck adalah platform kayu yang dibangun di tengah hutan mangrove Temajuk. Dari deck ini, pengunjung dapat menikmati pemandangan eksotis akar-akar mangrove yang menjulang dari air dan berbagai jenis burung yang bersarang di sekitarnya. Spot ini sangat ideal untuk fotografi landscape, wildlife, maupun portrait. Pada pagi hari, Anda dapat menyaksikan matahari terbit dengan latar belakang siluet pohon mangrove yang menciptakan pemandangan dramatis. Suasana sunyi dan tenang di area ini juga cocok untuk fotografi kontemplatif.",
    imageUrl: "https://images.pexels.com/photos/7177728/pexels-photo-7177728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    category: "Alam",
    location: "Hutan Mangrove Temajuk, Desa Temajuk, Kecamatan Paloh, Kabupaten Sambas",
    bestTime: "05.30 - 08.00 WIB dan 15.00 - 17.00 WIB",
    tips: [
      "Gunakan lensa wide-angle untuk menangkap keluasan hutan mangrove",
      "Pagi hari adalah waktu terbaik untuk fotografi wildlife karena banyak burung yang aktif",
      "Kenakan pakaian berwarna netral agar tidak mengganggu satwa liar",
      "Bawa repellent nyamuk karena area mangrove banyak nyamuk"
    ],
    gallery: [
      "https://images.pexels.com/photos/11869195/pexels-photo-11869195.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/14199312/pexels-photo-14199312.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1319515/pexels-photo-1319515.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    nearbyAttractions: [
      "Hutan Mangrove Temajuk",
      "Pantai Temajuk",
      "Warung Mie Khas Sambas"
    ]
  },
  {
    id: "bukit-maung-viewpoint",
    title: "Bukit Maung Viewpoint",
    description: "Puncak bukit dengan panorama 360 derajat pemandangan Temajuk, hutan tropis, dan Laut Natuna.",
    fullDescription: "Bukit Maung Viewpoint adalah spot foto spektakuler yang terletak di puncak Bukit Maung. Dari ketinggian ini, pengunjung dapat menikmati panorama 360 derajat yang mencakup seluruh Desa Temajuk, hutan tropis yang luas, dan hamparan Laut Natuna yang biru. Spot ini sangat populer untuk foto landscape, timelapse matahari terbit, dan foto udara. Pada hari yang cerah, Anda bahkan dapat melihat garis pantai Malaysia di kejauhan. Trek pendakian yang dikelilingi flora eksotis juga menawarkan banyak spot foto menarik sepanjang perjalanan menuju puncak.",
    imageUrl: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Pegunungan",
    location: "Bukit Maung, Desa Temajuk, Kecamatan Paloh, Kabupaten Sambas",
    bestTime: "04.30 - 07.00 WIB (sunrise) dan 16.00 - 18.00 WIB (sunset)",
    tips: [
      "Berangkat minimal 2 jam sebelum sunrise jika ingin melihat matahari terbit",
      "Bawa lensa tele untuk memotret detail kejauhan",
      "Bawa air dan snack yang cukup karena tidak ada penjual di puncak",
      "Pastikan cuaca cerah sebelum mendaki untuk hasil foto yang optimal"
    ],
    gallery: [
      "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/358010/pexels-photo-358010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    nearbyAttractions: [
      "Bukit Maung",
      "Air Terjun Carocok Antu Soreh",
      "Kedai Kopi Ujung Negeri"
    ]
  },
  {
    id: "perbatasan-landmark",
    title: "Landmark Perbatasan RI-Malaysia",
    description: "Monumen perbatasan yang menjadi spot foto ikonik dengan satu kaki di Indonesia dan satu kaki di Malaysia.",
    fullDescription: "Landmark Perbatasan RI-Malaysia adalah monumen yang menandai batas antara Indonesia dan Malaysia di Temajuk. Spot ini sangat populer untuk foto karena pengunjung dapat berfoto dengan satu kaki di Indonesia dan satu kaki di Malaysia. Tugu perbatasan yang berwarna merah putih dan biru putih merah menjadi latar belakang ikonik untuk foto kenang-kenangan. Area sekitar tugu yang berupa padang rumput dan beberapa pohon juga menawarkan spot foto yang bagus. Ini adalah salah satu lokasi yang wajib dikunjungi dan diabadikan saat berada di Temajuk.",
    imageUrl: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Landmark",
    location: "Perbatasan Indonesia-Malaysia, Desa Temajuk, Kecamatan Paloh, Kabupaten Sambas",
    bestTime: "08.00 - 16.00 WIB",
    tips: [
      "Bawa identitas diri lengkap karena akan ada pemeriksaan di pos perbatasan",
      "Jangan melewati batas negara tanpa izin resmi",
      "Datang pagi hari untuk menghindari antrean foto di tugu",
      "Gunakan lensa wide-angle untuk menangkap keseluruhan tugu dan lingkungan sekitar"
    ],
    gallery: [
      "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/2471970/pexels-photo-2471970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1576937/pexels-photo-1576937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    nearbyAttractions: [
      "Tugu Perbatasan Indonesia-Malaysia",
      "Hutan Perbatasan",
      "Warung Makan Mama Ina"
    ]
  },
  {
    id: "teluk-atong",
    title: "Teluk Atong",
    description: "Pantai ini dikenal karena atong adalah orang pertama yang mendirikan penginapan di kawasan ini.",
    fullDescription: "Pantai ini dikenal karena atong adalah orang pertama yang mendirikan penginapan di kawasan ini, daerah yang dulunya paling ujung dan dekat dengan hutan lindung Tanjung Datuk. Sekarang semakin ramai karena jalur menuju atong bahari sudah menjadi jalur utama wisata Desa Temajuk. Karakteristik pantai ini sama dengan pantai Camar Bulan, namun perbedaannya adalah ketika surut batu karang akan terhampar luas didepan pantai dan ketika air pasang kita bisa melakukan snorkeling disekitar pantai ini.",
    imageUrl: "https://images.pexels.com/photos/2159538/pexels-photo-2159538.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Teluk",
    location: "Kawasan Danau Laut Madu, Desa Temajuk, Kecamatan Paloh, Kabupaten Sambas",
    bestTime: "07.00 - 10.00 WIB dan 15.00 - 17.00 WIB",
    tips: [
      "Pagi hari adalah waktu terbaik untuk mendapatkan view pantai yang tenang untuk foto refleksi",
      "Bawa polarizing filter untuk mengurangi pantulan berlebih di permukaan air",
      "Gunakan drone (jika diizinkan) untuk mendapatkan sudut pandang aerial yang spektakuler",
      "Kenakan pakaian dengan warna yang kontras dengan lingkungan untuk hasil portrait yang menonjol"
    ],
    gallery: [
      "https://images.pexels.com/photos/2159538/pexels-photo-2159538.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1903702/pexels-photo-1903702.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    nearbyAttractions: [
      "Danau Laut Madu",
      "Hutan Temajuk",
      "Rumah Makan Bintang Laut"
    ]
  }
];