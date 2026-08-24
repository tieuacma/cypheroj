export interface CypherVoiceline {
  en: string;
  vi: string;
  category?: string;
  tag?: string;
}

export const ALL_CYPHER_VOICELINES: CypherVoiceline[] = [
  // --- Pick & Buy Phase ---
  {
    en: "Nothing stays hidden from me. Nothing.",
    vi: "Không gì có thể che giấu khỏi tôi. Không gì cả.",
    category: "pick",
    tag: "Pick",
  },
  {
    en: "They’re scared. I don’t need cameras to see that.",
    vi: "Chúng đang sợ hãi. Tôi chẳng cần camera cũng thấy rõ điều đó.",
    category: "buy",
    tag: "Buy Phase",
  },
  {
    en: "Nobody escapes me. But they’ll try.",
    vi: "Không ai thoát khỏi tôi. Nhưng chúng sẽ thử đấy.",
    category: "buy",
    tag: "Buy Phase",
  },
  {
    en: "I wonder if they have any parts I can salvage. Hmmm, implants? I need those!",
    vi: "Tôi tự hỏi liệu chúng có bộ phận nào tôi nhặt được không. Hmmm, linh kiện cấy ghép à? Tôi cần chúng!",
    category: "buy",
    tag: "Buy Phase",
  },
  {
    en: "Ah, okay, this is good! I’ve got new gadgets to try out…",
    vi: "Ah, tốt lắm! Tôi có thêm đồ chơi mới để thử nghiệm rồi…",
    category: "buy",
    tag: "Buy Phase",
  },
  {
    en: "I must survive to protect my family. I can’t lose them. I can’t feel that pain again…",
    vi: "Tôi phải sống sót để bảo vệ gia đình. Tôi không thể mất họ. Tôi không thể chịu nỗi đau đó lần nữa…",
    category: "buy",
    tag: "Buy Phase",
  },

  // --- Match Start ---
  {
    en: "Nothing escapes me. Don't worry, I won't tell anyone your secrets... unless I have to.",
    vi: "Không có gì thoát khỏi mắt tôi đâu. Đừng lo, tôi sẽ không tiết lộ bí mật của bạn... trừ khi bắt buộc.",
    category: "match_start",
    tag: "Match Start",
  },
  {
    en: "Remember, pictures or it didn't happen.",
    vi: "Nhớ đấy, phải có ảnh chụp làm bằng chứng, không là coi như chưa có gì xảy ra đâu.",
    category: "match_start",
    tag: "Match Start",
  },
  {
    en: "Where are they hiding?",
    vi: "Chúng đang trốn ở đâu nhỉ?",
    category: "match_start",
    tag: "Match Start",
  },
  {
    en: "Let's see what I have to work with.",
    vi: "Để xem hôm nay tôi có những công cụ gì nào.",
    category: "match_start",
    tag: "Match Start",
  },
  {
    en: "Do not worry. I have already spied out their path.",
    vi: "Đừng lo. Tôi đã thăm dò xong tuyến đường của chúng rồi.",
    category: "match_start",
    tag: "Match Start",
  },

  // --- Barrier Down / Round Start ---
  {
    en: "They have nowhere to hide.",
    vi: "Chúng chẳng còn nơi nào để trốn đâu.",
    category: "barrier_down",
    tag: "Barrier Down",
  },
  {
    en: "Let me find you again.",
    vi: "Để tôi tìm lại bạn nhé.",
    category: "barrier_down",
    tag: "Barrier Down",
  },
  {
    en: "My eyes will tip the balance.",
    vi: "Đôi mắt của tôi sẽ làm nghiêng cán cân trận đấu.",
    category: "barrier_down",
    tag: "Barrier Down",
  },
  {
    en: "I will find them.",
    vi: "Tôi sẽ tìm ra chúng.",
    category: "barrier_down",
    tag: "Barrier Down",
  },
  {
    en: "My intel is their obstacle.",
    vi: "Thông tin của tôi chính là chướng ngại của chúng.",
    category: "barrier_down",
    tag: "Barrier Down",
  },
  {
    en: "We... will reveal their secrets.",
    vi: "Chúng ta... sẽ vạch trần bí mật của chúng.",
    category: "barrier_down",
    tag: "Barrier Down",
  },

  // --- Abilities (C, Q, E, X) ---
  {
    en: "Setting a trap. Gotta watch your step.",
    vi: "Giăng bẫy! Phải chú ý bước đi đấy.",
    category: "ability_c",
    tag: "[C] Trapwire",
  },
  {
    en: "Caught one! Trip activated.",
    vi: "Tóm được một đứa! Bẫy đã kích hoạt.",
    category: "ability_c",
    tag: "[C] Trapwire",
  },
  {
    en: "Cage goes here. Block vision.",
    vi: "Đặt cage ở đây. Che tầm nhìn kẻ địch.",
    category: "ability_q",
    tag: "[Q] Cyber Cage",
  },
  {
    en: "Camera active. Eye in the sky. I'm watching.",
    vi: "Camera hoạt động. Mắt thần trên không. Tôi đang theo dõi.",
    category: "ability_e",
    tag: "[E] Spycam",
  },
  {
    en: "Tagged!",
    vi: "Đã đánh dấu tiêu điểm!",
    category: "ability_e",
    tag: "[E] Spycam",
  },
  {
    en: "I know EXACTLY where you are!",
    vi: "Tôi biết CHÍNH XÁC các người đang ở đâu!",
    category: "ability_x",
    tag: "[X] Neural Theft",
  },
  {
    en: "Give me a name!",
    vi: "Khai tên ra!",
    category: "ability_x",
    tag: "[X] Neural Theft",
  },

  // --- Kills & Headshots ---
  {
    en: "One for my collection.",
    vi: "Thêm một kẻ vào bộ sưu tập.",
    category: "kill",
    tag: "Eliminated",
  },
  {
    en: "No secrets left.",
    vi: "Chẳng còn bí mật nào nữa.",
    category: "kill",
    tag: "Eliminated",
  },
  {
    en: "You're read like an open book.",
    vi: "Ngươi bị bắt bài như một cuốn sách mở vậy.",
    category: "kill",
    tag: "Eliminated",
  },
  {
    en: "Headshot! Right between the eyes.",
    vi: "Headshot! Ngay giữa hai con mắt.",
    category: "headshot",
    tag: "Headshot",
  },
  {
    en: "My eyes are better than yours. Erased.",
    vi: "Đôi mắt của tôi tốt hơn của ngươi. Xóa sổ.",
    category: "headshot",
    tag: "Headshot",
  },
  {
    en: "Squashed the last bug. Wiped clean.",
    vi: "Đã đè bẹp con bọ cuối cùng. Quét sạch.",
    category: "last_kill",
    tag: "Ace / Last Kill",
  },

  // --- Agent Interactions ---
  {
    en: "Fade, your nightmares are loud, but my secrets are quiet.",
    vi: "Fade này, ác mộng của cô thì ồn ào, còn bí mật của tôi lại rất im lặng.",
    category: "interaction",
    tag: "Agent interaction",
  },
  {
    en: "Sova, let's see who reveals more today.",
    vi: "Sova, để xem hôm nay ai sẽ hé lộ được nhiều thông tin hơn nhé.",
    category: "interaction",
    tag: "Agent interaction",
  },
  {
    en: "Chamber, fancy clothes won't stop a bullet.",
    vi: "Chamber à, quần áo đắt tiền không đỡ được đạn đâu.",
    category: "interaction",
    tag: "Agent interaction",
  },
  {
    en: "Keep your tech running, Killjoy. I'll supply the intel.",
    vi: "Cứ giữ cho công nghệ của cô hoạt động đi, Killjoy. Phần tình báo cứ để tôi.",
    category: "interaction",
    tag: "Agent interaction",
  },

  // --- Round Win / Victory ---
  {
    en: "I see all. I know all.",
    vi: "Tôi thấy tất cả. Tôi biết tất cả.",
    category: "win",
    tag: "Round Victory",
  },
  {
    en: "Amateurs. Just as I planned.",
    vi: "Lũ gà mờ. Đúng như kế hoạch của tôi.",
    category: "win",
    tag: "Round Victory",
  },
  {
    en: "Don’t worry. The house always wins.",
    vi: "Đừng lo. Nhà cái luôn luôn thắng.",
    category: "win",
    tag: "Round Victory",
  },
  {
    en: "Good work, friends! Keep using my vision to your advantage.",
    vi: "Làm tốt lắm các bạn! Hãy tiếp tục tận dụng tầm nhìn của tôi.",
    category: "win",
    tag: "Round Victory",
  },
];

export function getRandomCypherQuote(category?: string): CypherVoiceline {
  if (category) {
    const filtered = ALL_CYPHER_VOICELINES.filter((q) => q.category === category);
    if (filtered.length > 0) {
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
  }
  return ALL_CYPHER_VOICELINES[Math.floor(Math.random() * ALL_CYPHER_VOICELINES.length)];
}

export function getRandomVoiceline(type?: string): CypherVoiceline {
  if (type === "compiling") return getRandomCypherQuote("ability_e");
  if (type === "testcasePass") return getRandomCypherQuote("kill");
  if (type === "accepted") return getRandomCypherQuote("win");
  if (type === "wrongAnswer") return getRandomCypherQuote("ability_c");
  if (type === "timeLimit") return getRandomCypherQuote("buy");
  if (type === "compilationError") return getRandomCypherQuote("headshot");
  return getRandomCypherQuote("match_start");
}
