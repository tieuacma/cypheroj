import type { Problem } from "./types";

const problems: Problem[] = [
  {
    id: "a_plus_b",
    title: "A + B Problem",
    timeLimit: 1000,
    memoryLimit: 256,
    group: "Cơ bản",
    category: "Toán học",
    acRate: "88%",
    acCount: 420,
    statement:
      "Given two integers $A$ and $B$, compute and print their sum.\n\nThis is a classic warm-up problem to verify your C++ environment on Cypher OJ.\n\n$$\\text{Result} = A + B$$",
    inputFormat:
      "A single line containing two integers $A$ and $B$ separated by a space.\n\nConstraints: $-10^9 \\le A, B \\le 10^9$",
    outputFormat: "Print a single integer — the sum of $A$ and $B$.",
    samples: [
      {
        input: "3 5",
        output: "8",
      },
      {
        input: "-10 7",
        output: "-3",
      },
      {
        input: "1000000000 1000000000",
        output: "2000000000",
      },
    ],
  },
  {
    id: "fibonacci",
    title: "Fibonacci Number",
    timeLimit: 2000,
    memoryLimit: 512,
    group: "Cơ bản",
    category: "Đệ quy / DP",
    acRate: "72%",
    acCount: 231,
    statement:
      "Given a non-negative integer $N$, compute the $N$-th Fibonacci number $F(N)$.\n\n$$F(0) = 0, F(1) = 1, F(N) = F(N-1) + F(N-2) \\text{ for } N \\ge 2$$",
    inputFormat:
      "A single line containing a non-negative integer $N$.\n\nConstraints: $0 \\le N \\le 45$",
    outputFormat: "Print a single integer — $F(N)$.",
    samples: [
      {
        input: "0",
        output: "0",
      },
      {
        input: "10",
        output: "55",
      },
      {
        input: "20",
        output: "6765",
      },
    ],
  },
  {
    id: "3",
    title: "Shortest Path (Dijkstra)",
    timeLimit: 1500,
    memoryLimit: 256,
    group: "Đồ thị",
    category: "Dijkstra",
    acRate: "48%",
    acCount: 84,
    statement:
      "Cho đồ thị vô hướng gồm $N$ đỉnh và $M$ cạnh có trọng số dương. Hãy tìm đường đi ngắn nhất từ đỉnh nguồn $S$ đến đỉnh đích $T$.\n\nCông thức cập nhật khoảng cách tại mỗi bước lặp của Dijkstra:\n$$d(v) = \\min(d(v), d(u) + w(u, v))$$",
    inputFormat:
      "Dòng đầu tiên chứa 4 số nguyên $N, M, S, T$ ($1 \\le N \\le 10^5, 1 \\le M \\le 2 \\cdot 10^5$).\n\n$M$ dòng tiếp theo, mỗi dòng chứa 3 số nguyên $u, v, w$ mô tả cạnh nối hai đỉnh $u, v$ có trọng số $w$ ($1 \\le w \\le 10^9$).",
    outputFormat:
      "In ra khoảng cách ngắn nhất từ $S$ đến $T$. Nếu không có đường đi, in ra $-1$.",
    samples: [
      {
        input: "3 3 1 3\n1 2 5\n2 3 3\n1 3 10",
        output: "8",
      },
    ],
  },
  {
    id: "4",
    title: "0-1 Knapsack",
    timeLimit: 2000,
    memoryLimit: 512,
    group: "Quy hoạch động",
    category: "DP / Knapsack",
    acRate: "56%",
    acCount: 152,
    statement:
      "Cho $N$ đồ vật có khối lượng $w_i$ và giá trị $v_i$, cùng một chiếc balo có tải trọng tối đa là $W$. Hãy chọn các đồ vật sao cho tổng khối lượng không vượt quá $W$ và tổng giá trị thu được là lớn nhất.\n\nCông thức truy hồi quy hoạch động tối ưu:\n$$DP[i][j] = \\max(DP[i-1][j], DP[i-1][j-w_i] + v_i)$$",
    inputFormat:
      "Dòng đầu tiên chứa hai số nguyên $N$ và $W$ ($1 \\le N \\le 100, 1 \\le W \\le 10^5$).\n\n$N$ dòng tiếp theo, dòng thứ $i$ chứa hai số nguyên $w_i$ và $v_i$ ($1 \\le w_i \\le W, 1 \\le v_i \\le 10^9$).",
    outputFormat: "In ra giá trị lớn nhất thu được.",
    samples: [
      {
        input: "4 5\n1 8\n2 4\n3 0\n2 5",
        output: "13",
      },
    ],
  },
];

export function getProblemById(id: string): Problem | null {
  return problems.find((p) => p.id === id) ?? null;
}

export function getAllProblems(): Problem[] {
  return problems;
}
