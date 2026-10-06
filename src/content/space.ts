// Everything on /space. To add something, add one line here.
// Images: book covers from Open Library, anime key art from AniList and Kitsu, hero artwork chosen by Tejas. Film posters: add a `poster` path once you have the file;
// until then the film gets a typographic card in its own colour.

export type Quote = {
  text: string;
  /** Original-language line, shown above the English (Sanskrit for the Gita, Hindi for Kabir). */
  original?: string;
  by: string;
  source?: string;
  /** true for Tejas's own lines */
  mine?: boolean;
};

/** The material each quote is shown on: Indian texts on a palm leaf (tālapatra), Greek and Roman
 *  philosophers carved in stone, Chinese classics on a hanging scroll, modern thinkers typewritten. */
export type Material = "leaf" | "stone" | "scroll" | "paper";
const MATERIAL: Record<string, Material> = {
  "Bhagavad Gita": "leaf", Kabir: "leaf", Chanakya: "leaf", "Adi Shankaracharya": "leaf",
  "Marcus Aurelius": "stone", Seneca: "stone", Epictetus: "stone", Socrates: "stone", Aristotle: "stone", Heraclitus: "stone",
  Confucius: "scroll", "Lao Tzu": "scroll",
};
export const materialOf = (q: Quote): Material => MATERIAL[q.by] ?? "paper";

/** Mixed so the same voice rarely shows two days running. One is picked per calendar day. */
export const quotes: Quote[] = [
  { original: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥", text: "Your right is to the work alone, never to its fruits. Don't let the fruit be your reason for acting, and don't hold on to doing nothing either.", by: "Bhagavad Gita", source: "2.47" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", by: "Marcus Aurelius", source: "Meditations, 5.20" },
  { text: "We suffer more often in imagination than in reality.", by: "Seneca", source: "Letters to Lucilius, 13" },
  { original: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥", text: "Lift yourself up by your own self; never let yourself sink. You are your own best friend, and your own worst enemy.", by: "Bhagavad Gita", source: "6.5" },
  { text: "Men are disturbed not by things, but by the views which they take of things.", by: "Epictetus", source: "Enchiridion, 5" },
  { original: "काल करे सो आज कर, आज करे सो अब। पल में परलय होएगी, बहुरि करेगा कब॥", text: "What you'd leave for tomorrow, do today; what you'd do today, do now. Everything can end in a moment, and then when will you do it?", by: "Kabir" },
  { text: "If we have our own why of life, we shall get along with almost any how.", by: "Friedrich Nietzsche", source: "Twilight of the Idols" },
  { original: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥", text: "Do your work steady within, letting go of attachment, the same whether it succeeds or fails. That evenness is what yoga means.", by: "Bhagavad Gita", source: "2.48" },
  { text: "The unexamined life is not worth living.", by: "Socrates", source: "Plato, Apology" },
  { text: "A journey of a thousand miles begins beneath one's feet.", by: "Lao Tzu", source: "Tao Te Ching, 64" },
  { original: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः। आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥", text: "Heat and cold, pleasure and pain: they come and they go, and none of them lasts. Learn to bear them.", by: "Bhagavad Gita", source: "2.14" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", by: "Marcus Aurelius", source: "Meditations, 10.16" },
  { text: "Arise, awake, and stop not till the goal is reached.", by: "Swami Vivekananda" },
  { original: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्। स्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥", text: "Better your own path walked imperfectly than someone else's walked well.", by: "Bhagavad Gita", source: "3.35" },
  { text: "First say to yourself what you would be; and then do what you have to do.", by: "Epictetus", source: "Discourses, 3.23" },
  { text: "Character is destiny.", by: "Heraclitus", source: "Fragment 119" },
  { original: "असंशयं महाबाहो मनो दुर्निग्रहं चलम्। अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥", text: "No doubt the mind is restless and hard to hold. But practice holds it, and so does letting go.", by: "Bhagavad Gita", source: "6.35" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", by: "Seneca", source: "On the Shortness of Life" },
  { text: "When you know a thing, to hold that you know it; and when you do not know a thing, to allow that you do not know it: this is knowledge.", by: "Confucius", source: "Analects, 2.17" },
  { original: "यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः। स यत्प्रमाणं कुरुते लोकस्तदनुवर्तते॥", text: "Whatever the best among us do, everyone else follows. The standard they set is the one the world lives by.", by: "Bhagavad Gita", source: "3.21" },
  { text: "Everything can be taken from a man but one thing: the last of the human freedoms, to choose one's attitude in any given set of circumstances.", by: "Viktor Frankl", source: "Man's Search for Meaning" },
  { text: "In the midst of winter, I found there was, within me, an invincible summer.", by: "Albert Camus", source: "Return to Tipasa" },
  { original: "नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः। न चैनं क्लेदयन्त्यापो न शोषयति मारुतः॥", text: "No weapon cuts it, no fire burns it, no water wets it, no wind dries it.", by: "Bhagavad Gita", source: "2.23" },
  { text: "One swallow does not make a summer, nor does one day; and so too one day, or a short time, does not make a man blessed and happy.", by: "Aristotle", source: "Nicomachean Ethics" },
  { original: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥", text: "Whenever what is right fades and what is wrong rises, I bring myself forth.", by: "Bhagavad Gita", source: "4.7" },
  { text: "Above all, don't lie to yourself.", by: "Fyodor Dostoevsky", source: "The Brothers Karamazov" },
  { original: "प्रजासुखे सुखं राज्ञः प्रजानां च हिते हितम्। नात्मप्रियं हितं राज्ञः प्रजानां तु प्रियं हितम्॥", text: "A king's happiness lies in his people's happiness, his good in their good. What pleases him is not his good; what pleases his people is.", by: "Chanakya", source: "Arthashastra 1.19" },
  { text: "Who looks outside, dreams; who looks inside, awakes.", by: "Carl Jung", source: "Letter to Fanny Bowditch, 1916" },
  { original: "ब्रह्म सत्यं जगन्मिथ्या जीवो ब्रह्मैव नापरः।", text: "Brahman alone is real, the world is appearance, and the self is nothing other than Brahman.", by: "Adi Shankaracharya" },
  { text: "The voice of the intellect is a soft one, but it does not rest till it has gained a hearing.", by: "Sigmund Freud", source: "The Future of an Illusion" },
];

export type Hero = { name: string; title: string; note: string; img: string; pos: string };

/** Artwork and photos chosen by Tejas. `pos` keeps the face in frame when the panel is narrow. */
export const heroes: Hero[] = [
  { name: "Chhatrapati Shivaji Maharaj", title: "The king who built Swarajya", note: "Founded a kingdom out of hill forts, courage and impossible odds.", img: "/space/heroes/shivaji-hd.webp", pos: "80% 28%" },
  { name: "Chanakya", title: "The strategist", note: "Teacher, kingmaker, and author of the Arthashastra.", img: "/space/heroes/chanakya-hd.webp", pos: "50% 22%" },
  { name: "Lord Ram", title: "Maryada Purushottam", note: "Gave up a kingdom to keep his father's word.", img: "/space/heroes/ram-hd.webp", pos: "50% 60%" },
  { name: "Hanuman", title: "Strength in service", note: "Strong enough to lift a mountain, humble enough to call himself a servant.", img: "/space/heroes/hanuman-hd.webp", pos: "36% 32%" },
  { name: "Lord Krishna", title: "The voice of the Gita", note: "Taught that the work is yours, and the fruit is not.", img: "/space/heroes/krishna-hd.webp", pos: "50% 24%" },
  { name: "Cristiano Ronaldo", title: "Mr. Champions League", note: "Five Ballon d'Ors, and still the first one at training.", img: "/space/heroes/ronaldo-hd.webp", pos: "48% 38%" },
  { name: "Rohit Sharma", title: "The Hitman", note: "Captained India to two ICC trophies, the 2024 T20 World Cup and the 2025 Champions Trophy.", img: "/space/heroes/rohit-hd.webp", pos: "55% 38%" },
];

export type Film = { title: string; year: string; by: string; lang?: string; tint: string; poster?: string; pos?: string };

export const films: Film[] = [
  { title: "Baahubali", year: "2015–2017", by: "S. S. Rajamouli", lang: "Telugu", tint: "#c8902e", poster: "/space/films/baahubali.webp" },
  { title: "Interstellar", year: "2014", by: "Christopher Nolan", tint: "#4a6f8c", poster: "/space/films/interstellar.webp" },
  { title: "The Martian", year: "2015", by: "Ridley Scott", tint: "#c2602f", poster: "/space/films/the-martian.webp" },
  { title: "John Wick series", year: "2014–2023", by: "Chad Stahelski", tint: "#3b5d63", poster: "/space/films/john-wick.webp" },
  { title: "3 Idiots", year: "2009", by: "Rajkumar Hirani", lang: "Hindi", tint: "#c9a227", poster: "/space/films/3-idiots.webp" },
  { title: "The Dark Knight", year: "2008", by: "Christopher Nolan", tint: "#2c3e5c", poster: "/space/films/the-dark-knight.webp" },
  { title: "Natarang", year: "2010", by: "Ravi Jadhav", lang: "Marathi", tint: "#a8336a", poster: "/space/films/natarang.webp", pos: "50% 22%" },
  { title: "Natsamrat", year: "2016", by: "Mahesh Manjrekar", lang: "Marathi", tint: "#8c2f2f", poster: "/space/films/natsamrat.webp" },
  { title: "Aga Bai Arrechya!", year: "2004", by: "Kedar Shinde", lang: "Marathi", tint: "#3f8a5a", poster: "/space/films/aga-bai-arrechya.webp" },
];

export type Anime = { title: string; year: number; cover: string };

export const anime: Anime[] = [
  { title: "Death Note", year: 2006, cover: "/space/anime/death-note-hd.webp" },
  { title: "Vinland Saga", year: 2019, cover: "/space/anime/vinland-saga-hd.webp" },
  { title: "Code Geass: Lelouch of the Rebellion", year: 2006, cover: "/space/anime/code-geass-hd.webp" },
  { title: "Jujutsu Kaisen", year: 2020, cover: "/space/anime/jujutsu-kaisen-hd.webp" },
  { title: "Demon Slayer", year: 2019, cover: "/space/anime/demon-slayer-hd.webp" },
  { title: "Ron Kamonohashi's Forbidden Deductions", year: 2023, cover: "/space/anime/ron-kamonohashi-hd.webp" },
  { title: "Horimiya", year: 2021, cover: "/space/anime/horimiya-hd.webp" },
  { title: "The Devil Is a Part-Timer!", year: 2013, cover: "/space/anime/devil-part-timer-hd.webp" },
  { title: "Parasyte: The Maxim", year: 2014, cover: "/space/anime/parasyte-hd.webp" },
  { title: "Psycho-Pass", year: 2012, cover: "/space/anime/psycho-pass-hd.webp" },
  { title: "Haikyu!!", year: 2014, cover: "/space/anime/haikyu-hd.webp" },
  { title: "Blue Lock", year: 2022, cover: "/space/anime/blue-lock-hd.webp" },
  { title: "Solo Leveling", year: 2024, cover: "/space/anime/solo-leveling-hd.webp" },
  { title: "Gachiakuta", year: 2025, cover: "/space/anime/gachiakuta-hd.webp" },
  { title: "Spy x Family", year: 2022, cover: "/space/anime/spy-family-hd.webp" },
  { title: "One-Punch Man", year: 2015, cover: "/space/anime/one-punch-man-hd.webp" },
  { title: "My Hero Academia", year: 2016, cover: "/space/anime/my-hero-academia-hd.webp" },
  { title: "Dandadan", year: 2024, cover: "/space/anime/dandadan-hd.webp" },
  { title: "Kaiju No. 8", year: 2024, cover: "/space/anime/kaiju-8-hd.webp" },
  { title: "Sakamoto Days", year: 2025, cover: "/space/anime/sakamoto-days-hd.webp" },
  { title: "Liar Game", year: 2026, cover: "/space/anime/liar-game-hd.webp" },
];

export type Book = { title: string; author: string; cover: string; spine: string; spineInk: string };

export const books: Book[] = [
  { title: "The 5 AM Club", author: "Robin Sharma", cover: "/space/books/5am-club-hd.webp", spine: "#e2581c", spineInk: "#fff" },
  { title: "Ikigai", author: "Héctor García and Francesc Miralles", cover: "/space/books/ikigai-hd.webp", spine: "#8cc4d8", spineInk: "#1b2b33" },
  { title: "The Power of Your Subconscious Mind", author: "Joseph Murphy", cover: "/space/books/subconscious-mind-hd.webp", spine: "#1c1a3c", spineInk: "#f2c84b" },
  { title: "The Psychology of Money", author: "Morgan Housel", cover: "/space/books/psychology-of-money-hd.webp", spine: "#ebe6dc", spineInk: "#22201c" },
];
