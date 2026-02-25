var ch1 = {
  id: 1,
  slug: 'stl-containers',
  title: 'STL Containers',
  description: 'Core sequence and associative containers: vector, array, string, string_view, set, deque, queue, map, unordered_map — when to use each and how they work under the hood.',
  level: 'basic',
  estimatedMinutes: 22,
  tags: ['vector', 'array', 'string', 'string_view', 'set', 'unordered_set', 'deque', 'queue', 'map', 'unordered_map', 'emplace', 'STL', 'containers'],

  sections: [
    {
      id: 'vec-overview',
      title: 'std::vector — Dynamic Array',
      content: `
<p><code>std::vector</code> is the workhorse of C++ containers: a heap-allocated, contiguous array that grows automatically. It combines the cache-friendly access of a raw array with automatic memory management.</p>
<p>Internally it tracks three values: a pointer to heap memory, the current <em>size</em> (number of live elements), and the <em>capacity</em> (allocated slots). When size reaches capacity, the vector reallocates — typically doubling capacity — and moves all elements to the new buffer.</p>
<div class="callout info">
  <span class="callout-icon">ℹ</span>
  <div class="callout-content"><p><strong>Reallocation invalidates all iterators, pointers, and references</strong> into the vector. Always re-fetch iterators after any operation that might grow the vector.</p></div>
</div>
<p>Use <code>reserve(n)</code> to pre-allocate capacity when you know the approximate final size — this avoids repeated reallocations.</p>`,
      codeBlocks: [
        {
          id: 'vec-basic',
          language: 'cpp',
          caption: 'Common vector operations',
          code: `#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v;
    v.reserve(100);          // Pre-allocate, avoids reallocation

    v.push_back(1);          // O(1) amortized
    v.emplace_back(2);       // Construct in-place (prefer for complex types)
    v.insert(v.begin(), 0);  // O(n) — shifts elements right

    v[0];                    // No bounds check — undefined if out of range
    v.at(0);                 // Bounds-checked — throws std::out_of_range

    v.pop_back();            // O(1) — no reallocation
    v.erase(v.begin());      // O(n) — shifts remaining elements left

    // Range-based for
    for (const auto& x : v) { /* ... */ }

    // Size / capacity
    v.size();       // live elements
    v.capacity();   // allocated slots
    v.empty();      // true if size == 0

    v.shrink_to_fit();  // release excess capacity (non-binding hint)
    v.clear();          // destroys elements, keeps capacity
}`
        }
      ],
      diagrams: [
        {
          id: 'vec-memory-diagram',
          type: 'svg',
          src: 'assets/diagrams/vector-memory.svg',
          caption: 'std::vector internal layout — ptr, size, capacity'
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'push_back / emplace_back', complexity: 'amortized O(1)' },
          { operation: 'pop_back',                 complexity: 'O(1)' },
          { operation: 'operator[] / at()',        complexity: 'O(1)' },
          { operation: 'insert(pos, val)',          complexity: 'O(n)' },
          { operation: 'erase(pos)',               complexity: 'O(n)' },
          { operation: 'find (linear scan)',       complexity: 'O(n)' },
          { operation: 'reserve(n)',               complexity: 'O(n)', notes: 'Copies/moves all elements' },
        ]
      }
    },

    {
      id: 'array-overview',
      title: 'std::array — Fixed-Size Stack Array',
      content: `
<p><code>std::array&lt;T, N&gt;</code> is a thin wrapper around a C-style array. The size <strong>N</strong> is a compile-time constant — no heap allocation, no pointer indirection. It lives entirely on the stack.</p>
<p>Prefer <code>std::array</code> over raw <code>T arr[N]</code>: it supports value semantics (copyable, assignable), knows its own size, and works with STL algorithms. Prefer it over <code>vector</code> when size is fixed and small.</p>
<div class="callout tip">
  <span class="callout-icon">✓</span>
  <div class="callout-content"><p>For constant lookup tables, option lists, or any fixed-size collection, <code>std::array</code> gives zero overhead vs. a plain C array while being safer and more expressive.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'array-basic',
          language: 'cpp',
          caption: 'std::array usage',
          code: `#include <array>
#include <algorithm>

// Size is part of the type — no heap allocation
std::array<int, 5> a = {1, 2, 3, 4, 5};

a[2];           // O(1), no bounds check
a.at(2);        // O(1), throws if out of range
a.size();       // always 5 (compile-time constant)
a.front();      // a[0]
a.back();       // a[4]
a.data();       // pointer to underlying C array

// Works with all STL algorithms
std::sort(a.begin(), a.end());
auto it = std::find(a.begin(), a.end(), 3);

// Structured bindings (C++17)
auto [x, y, z, u, v] = a;`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'operator[] / at()', complexity: 'O(1)' },
          { operation: 'front / back',      complexity: 'O(1)' },
          { operation: 'fill(val)',          complexity: 'O(n)' },
          { operation: 'std::sort',          complexity: 'O(n log n)' },
        ]
      }
    },

    {
      id: 'string-overview',
      title: 'std::string — Dynamic String',
      content: `
<p><code>std::string</code> is a <code>vector&lt;char&gt;</code> with string-specific operations: it owns its character buffer, grows on demand, and is null-terminated (so <code>c_str()</code> always works).</p>
<p><strong>Small String Optimization (SSO):</strong> Most implementations store short strings (≤15 chars on 64-bit) directly inside the string object — no heap allocation. This makes short strings essentially free.</p>
<p>For read-only access without ownership, prefer <code>std::string_view</code> (C++17) — it's a non-owning view over any contiguous char sequence (string literal, string, vector&lt;char&gt;) with zero allocation.</p>
<div class="callout warning">
  <span class="callout-icon">⚠</span>
  <div class="callout-content"><p><strong>Dangling string_view:</strong> A <code>string_view</code> must not outlive the string it references. Storing a <code>string_view</code> of a temporary is undefined behaviour.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'string-basic',
          language: 'cpp',
          caption: 'std::string key operations',
          code: `#include <string>
#include <string_view>

std::string s = "Hello, C++";

// Concatenation
s += " world";             // O(n) if reallocation needed
s.append("!");

// Searching
s.find("C++");             // returns position or string::npos
s.rfind('!');              // search from right
s.starts_with("Hello");    // C++20
s.ends_with("!");          // C++20

// Substrings
s.substr(7, 3);            // returns new string — O(n)
std::string_view sv = s;   // zero-copy view — O(1)
sv.substr(7, 3);           // also O(1) — just adjusts ptr+len

// Conversion
int n = std::stoi("42");
std::string ns = std::to_string(42);

// Comparison — lexicographic
s == "Hello, C++ world!";  // O(n)
s < "Z";                   // true (H < Z)`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'operator[] / at()',  complexity: 'O(1)' },
          { operation: 'push_back / +=',     complexity: 'amortized O(1)' },
          { operation: 'find(str)',           complexity: 'O(n·m)', notes: 'naive; m = pattern length' },
          { operation: 'substr(pos, len)',    complexity: 'O(len)' },
          { operation: 'string_view::substr',complexity: 'O(1)' },
        ]
      }
    },

    {
      id: 'unordered-map-overview',
      title: 'std::unordered_map — Hash Map',
      content: `
<p><code>std::unordered_map&lt;K,V&gt;</code> provides average-case O(1) lookup, insertion, and deletion using a hash table with separate chaining. Keys must be hashable (built-in types are; custom types need a <code>std::hash</code> specialization or custom hasher).</p>
<p>Internally it maintains a <em>bucket array</em>. Each bucket is a linked list of key-value pairs that hash to the same slot. The <em>load factor</em> (size / bucket count) triggers a rehash when it exceeds the threshold (default 1.0), which doubles the bucket array and re-inserts all elements — O(n).</p>
<div class="callout warning">
  <span class="callout-icon">⚠</span>
  <div class="callout-content"><p><strong>Worst-case O(n):</strong> With poor hash functions (many collisions), all operations degrade to O(n). For adversarial inputs, consider a randomized hasher.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'umap-basic',
          language: 'cpp',
          caption: 'unordered_map operations',
          code: `#include <unordered_map>
#include <string>

std::unordered_map<std::string, int> freq;

// Insert / update
freq["apple"] = 1;          // operator[] inserts default if missing
freq["banana"]++;
freq.insert({"cherry", 3}); // fails if key exists
freq.emplace("date", 4);    // constructs in-place

// Lookup
auto it = freq.find("apple");  // O(1) avg
if (it != freq.end()) {
    it->second;  // value
}
freq.count("apple");   // 0 or 1 (use for existence check)
freq.contains("apple"); // C++20 — cleaner

// Erase
freq.erase("banana");   // O(1) avg
freq.erase(it);         // by iterator

// Iteration (unordered!)
for (const auto& [key, val] : freq) {
    // C++17 structured binding
}

// Tuning
freq.reserve(1000);           // pre-size buckets
freq.max_load_factor(0.75f);  // rehash sooner`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'find / count / contains', complexity: 'O(1)',  notes: 'average; O(n) worst case' },
          { operation: 'insert / emplace',         complexity: 'O(1)',  notes: 'average; O(n) on rehash' },
          { operation: 'erase(key)',               complexity: 'O(1)',  notes: 'average' },
          { operation: 'rehash / reserve',         complexity: 'O(n)' },
          { operation: 'iteration',                complexity: 'O(n)' },
        ]
      }
    },

    {
      id: 'map-overview',
      title: 'std::map — Ordered Map (Red-Black Tree)',
      content: `
<p><code>std::map&lt;K,V&gt;</code> stores key-value pairs in a <em>sorted</em> red-black tree. All operations are O(log n). Keys require only <code>operator&lt;</code> (or a custom comparator). Unlike <code>unordered_map</code>, iteration always yields keys in sorted order.</p>
<p>Choose <code>map</code> over <code>unordered_map</code> when you need:</p>
<ul>
  <li>Ordered iteration (e.g., printing a sorted frequency table)</li>
  <li>Range queries: <code>lower_bound</code>, <code>upper_bound</code></li>
  <li>Keys that aren't hashable (e.g., custom structs with only <code>&lt;</code>)</li>
  <li>Worst-case O(log n) guarantees</li>
</ul>
<div class="callout info">
  <span class="callout-icon">ℹ</span>
  <div class="callout-content"><p>For small maps (&lt;32 elements), a sorted <code>vector&lt;pair&gt;</code> with binary search often outperforms <code>std::map</code> due to better cache locality — no pointer-chasing through tree nodes.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'map-basic',
          language: 'cpp',
          caption: 'std::map and ordered operations',
          code: `#include <map>
#include <string>

std::map<std::string, int> scores;

scores["Alice"] = 95;
scores.emplace("Bob", 88);

// Ordered — iterates alphabetically
for (const auto& [name, score] : scores) {
    // Alice → 95, Bob → 88
}

// Range queries (unique to ordered containers)
auto lo = scores.lower_bound("A");  // first key >= "A"
auto hi = scores.upper_bound("B");  // first key >  "B"
// [lo, hi) gives all names in ["A", "B"]

scores.find("Alice");   // O(log n)
scores.count("Alice");  // 0 or 1

// Neighbour access
auto it = scores.find("Bob");
++it;  // next key (std::map iterators are bidirectional)`
        }
      ],
      diagrams: [
        {
          id: 'map-tree-diagram',
          type: 'svg',
          src: 'assets/diagrams/map-tree.svg',
          caption: 'Red-black tree node layout (std::map)'
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'find / count',              complexity: 'O(log n)' },
          { operation: 'insert / emplace',           complexity: 'O(log n)' },
          { operation: 'erase(key)',                 complexity: 'O(log n)' },
          { operation: 'lower_bound / upper_bound',  complexity: 'O(log n)' },
          { operation: 'iteration',                  complexity: 'O(n)' },
        ]
      }
    },

    {
      id: 'string-view',
      title: 'std::string_view — Non-Owning Views',
      content: `<p><code>std::string_view</code> (C++17) is a <strong>non-owning handle</strong> to a character sequence — a pointer plus a length. It incurs <em>zero allocation</em> and can refer to any contiguous character source: a string literal, a <code>std::string</code>, a <code>char[]</code>, or a sub-range.</p>
<h3>Pros</h3>
<ul>
  <li><strong>Zero-copy parameter passing:</strong> Accepting <code>std::string_view</code> instead of <code>const std::string&amp;</code> avoids allocating a new <code>std::string</code> when the caller passes a literal.</li>
  <li><strong>O(1) substring:</strong> <code>sv.substr(pos, len)</code> returns a view — just adjusts pointer and length, no copy.</li>
  <li><strong>Universal:</strong> A single <code>string_view</code> parameter accepts <code>std::string</code>, string literals, <code>char*</code>, and any contiguous char buffer seamlessly.</li>
  <li><strong>Rich read-only API:</strong> <code>find</code>, <code>starts_with</code>, <code>ends_with</code>, <code>remove_prefix</code>, <code>remove_suffix</code> — all without allocating.</li>
</ul>
<h3>Cons &amp; Pitfalls</h3>
<div class="callout danger">
  <span class="callout-icon">✗</span>
  <div class="callout-content"><p><strong>Non-owning — lifetime is your responsibility.</strong> The view must not outlive the character data it references. A view of a temporary or a local string is a dangling pointer and undefined behaviour.</p></div>
</div>
<div class="callout warning">
  <span class="callout-icon">⚠</span>
  <div class="callout-content"><p><strong>Not null-terminated.</strong> <code>string_view</code> has no <code>c_str()</code>. Passing <code>sv.data()</code> to a C API (like <code>fopen</code>) that expects a null-terminated string is unsafe unless you know the source is null-terminated. Convert to <code>std::string</code> first.</p></div>
</div>
<p>Other limitations: read-only (no mutation), and should not be stored as a class member unless lifetime is carefully guaranteed.</p>`,
      codeBlocks: [
        {
          id: 'sv-correct',
          language: 'cpp',
          caption: 'Correct string_view usage',
          code: `#include <string_view>
#include <string>

// ✓ Best use: read-only function parameter
//   Accepts std::string, literals, char[] — no allocation
bool starts_with_http(std::string_view url) {
    return url.starts_with("http://");  // C++20, O(n) compare, no copy
}

// ✓ Efficient sub-string parsing
std::string_view first_token(std::string_view text) {
    auto pos = text.find(' ');
    return pos == std::string_view::npos ? text : text.substr(0, pos);
    // O(1) — just a pointer+length adjustment, no allocation
}

void demo() {
    std::string s = "http://example.com";
    starts_with_http(s);           // ✓ no copy of s
    starts_with_http("http://x");  // ✓ no allocation at all

    std::string_view sv = "  hello world  ";
    sv.remove_prefix(2);  // advance pointer — O(1)
    sv.remove_suffix(2);  // shrink length   — O(1)
    // sv == "hello world"
}`
        },
        {
          id: 'sv-wrong',
          language: 'cpp',
          caption: 'Dangerous string_view pitfalls',
          code: `#include <string_view>
#include <string>
#include <cstdio>

// ✗ WRONG — dangling: local string destroyed on return
std::string_view get_greeting() {
    std::string s = "hello";
    return s;  // UB: s is destroyed, view is left dangling
}

// ✗ WRONG — view of a temporary std::string
//   The temporary is destroyed at the end of the full-expression
std::string_view sv = std::string("hello");  // dangling immediately

// ✗ WRONG — C API expects null-termination, view may not provide it
std::string_view path = "/tmp/file";
FILE* f = fopen(path.data(), "r");  // fragile — safe only for literals

// ✓ CORRECT — convert to std::string for C APIs
FILE* f2 = fopen(std::string(path).c_str(), "r");

// ✗ RISKY — storing view as member without guaranteed lifetime
struct Parser {
    std::string_view input;  // who owns the string? easy to get wrong
};

// ✓ SAFE — store an owning string if lifetime is uncertain
struct SafeParser {
    std::string input;  // owns a copy
};`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'Construct from string/literal', complexity: 'O(1)',   notes: 'Pointer + length only, no copy' },
          { operation: 'substr(pos, len)',               complexity: 'O(1)',   notes: 'Returns view — no allocation' },
          { operation: 'find(pattern)',                  complexity: 'O(n·m)', notes: 'Same as std::string::find' },
          { operation: 'starts_with / ends_with',        complexity: 'O(k)',   notes: 'k = prefix/suffix length' },
          { operation: 'remove_prefix / remove_suffix',  complexity: 'O(1)' },
          { operation: 'operator==',                     complexity: 'O(n)',   notes: 'Character-by-character compare' },
        ]
      }
    },

    {
      id: 'set-unordered-set',
      title: 'std::set & std::unordered_set',
      content: `<p>The <em>set</em> containers store <strong>unique keys only</strong> — no associated values. Duplicate insertions are silently discarded. Use them for fast membership testing and deduplication.</p>
<p><code>std::set</code> is a red-black tree: keys are always sorted, every operation is O(log n), and it supports <code>lower_bound</code> / <code>upper_bound</code> range queries — the same as <code>std::map</code> but without carrying a value.</p>
<p><code>std::unordered_set</code> uses a hash table: average O(1) for insert/find/erase, but no ordering. Choose it when you only need membership testing and order doesn't matter.</p>
<div class="callout info">
  <span class="callout-icon">ℹ</span>
  <div class="callout-content"><p><strong>Multiset variants:</strong> <code>std::multiset</code> and <code>std::unordered_multiset</code> allow duplicate keys. <code>count(k)</code> can return values greater than 1, and <code>equal_range(k)</code> gives all matching elements.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'set-basic',
          language: 'cpp',
          caption: 'std::set and std::unordered_set',
          code: `#include <set>
#include <unordered_set>

// ── std::set — ordered, O(log n) ─────────────────────────
std::set<int> s = {5, 2, 8, 1, 9, 2};  // duplicates discarded
// s contains: {1, 2, 5, 8, 9}  (always sorted)

s.insert(7);          // O(log n)
s.erase(2);           // O(log n)
s.contains(5);        // C++20 — O(log n)
s.count(5);           // 0 or 1 — pre-C++20 existence check

// Sorted iteration
for (int x : s) { /* ascending: 1 5 7 8 9 */ }

// Range queries — same API as std::map
auto lo = s.lower_bound(5);  // first element >= 5
auto hi = s.upper_bound(8);  // first element >  8
// [lo, hi) iterates over {5, 7, 8}

// ── std::unordered_set — O(1) avg, unordered ─────────────
std::unordered_set<std::string> visited;
visited.insert("home");
visited.insert("about");
visited.contains("home");    // true  — O(1) avg
visited.contains("contact"); // false — O(1) avg

// Deduplication in one shot
std::vector<int> data = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
std::unordered_set<int> unique(data.begin(), data.end());
// unique = {1, 2, 3, 4, 5, 6, 9} — order not guaranteed`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'set::insert / erase / find',           complexity: 'O(log n)' },
          { operation: 'set::lower_bound / upper_bound',        complexity: 'O(log n)' },
          { operation: 'set::iteration',                        complexity: 'O(n)', notes: 'Always sorted order' },
          { operation: 'unordered_set::insert / erase / find', complexity: 'O(1)',    notes: 'Average; O(n) worst case' },
          { operation: 'unordered_set::iteration',             complexity: 'O(n)',    notes: 'No ordering guarantee' },
        ]
      }
    },

    {
      id: 'queue-deque',
      title: 'std::deque & std::queue',
      content: `<p><code>std::deque</code> (double-ended queue) provides O(1) insertion and removal at <em>both</em> the front and the back, plus O(1) random access. Unlike <code>std::vector</code>, it never needs to move existing elements when you push to the front — making <code>push_front</code> genuinely O(1) instead of O(n).</p>
<p>Internally a deque uses a <em>segmented buffer</em>: an array of fixed-size chunks rather than one giant contiguous allocation. This means:</p>
<ul>
  <li>No reallocation when pushing to either end — references to existing elements remain valid (but iterators are still invalidated on modification).</li>
  <li>Slightly lower cache efficiency than <code>std::vector</code> due to one extra level of indirection.</li>
</ul>
<p><code>std::queue</code> is a thin <em>container adapter</em> that enforces strict FIFO order. It wraps <code>std::deque</code> by default and exposes only <code>push</code> / <code>pop</code> / <code>front</code> / <code>back</code>. There is no random access — the limited interface intentionally prevents misuse.</p>
<div class="callout tip">
  <span class="callout-icon">✓</span>
  <div class="callout-content"><p><strong>BFS pattern:</strong> <code>std::queue</code> is the standard container for breadth-first search. The FIFO contract perfectly models "process level by level" traversal. Note that <code>pop()</code> returns <code>void</code> — read <code>front()</code> before popping.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'deque-queue-basic',
          language: 'cpp',
          caption: 'std::deque and std::queue',
          code: `#include <deque>
#include <queue>

// ── std::deque — O(1) at both ends ───────────────────────
std::deque<int> dq = {2, 3, 4};

dq.push_front(1);   // O(1) — {1, 2, 3, 4}
dq.push_back(5);    // O(1) — {1, 2, 3, 4, 5}
dq.pop_front();     // O(1) — removes 1
dq.pop_back();      // O(1) — removes 5
dq[1];              // O(1) random access — no bounds check
dq.at(1);           // O(1) — bounds-checked

// insert/erase in the middle is still O(n)
dq.insert(dq.begin() + 1, 99);

// ── std::queue — pure FIFO adapter ───────────────────────
std::queue<std::string> tasks;
tasks.push("compile");  // enqueue at back
tasks.push("link");
tasks.push("run");

tasks.front();  // "compile" — peek without removing
tasks.back();   // "run"
tasks.pop();    // dequeue front — void, no return value!
// tasks.front() is now "link"

tasks.empty();  // false
tasks.size();   // 2

// ── BFS skeleton ─────────────────────────────────────────
std::queue<int> frontier;
frontier.push(startNode);
while (!frontier.empty()) {
    int node = frontier.front();
    frontier.pop();
    for (int neighbour : graph[node])
        frontier.push(neighbour);
}`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'deque::push_front / push_back',  complexity: 'O(1)' },
          { operation: 'deque::pop_front / pop_back',    complexity: 'O(1)' },
          { operation: 'deque::operator[] / at()',        complexity: 'O(1)' },
          { operation: 'deque::insert / erase (middle)', complexity: 'O(n)' },
          { operation: 'queue::push / pop',              complexity: 'O(1)' },
          { operation: 'queue::front / back',            complexity: 'O(1)' },
        ]
      }
    },

    {
      id: 'emplace-construct',
      title: 'emplace — In-Place Construction',
      content: `<p>Every STL container has <code>emplace</code> variants (<code>emplace_back</code>, <code>emplace_front</code>, <code>emplace</code>) that construct elements <strong>directly inside the container's storage</strong> using placement new. The arguments you pass are forwarded to the constructor — no temporary object is ever created.</p>
<p>Contrast with <code>push_back</code>:</p>
<ul>
  <li><code>v.push_back(T{args})</code> — constructs a temporary <code>T</code>, then <em>moves</em> it into the vector (2 steps).</li>
  <li><code>v.emplace_back(args)</code> — constructs <code>T</code> once, directly in-place (1 step, no move).</li>
</ul>
<p>For cheap-to-move types like <code>std::string</code> or scalars the difference is negligible. It matters for <strong>non-copyable types</strong> (e.g. <code>std::unique_ptr</code>, <code>std::mutex</code>) where <code>emplace</code> is the <em>only</em> option.</p>
<h3>try_emplace (C++17)</h3>
<p><code>map::try_emplace(key, args...)</code> inserts only if the key is absent. Crucially, it does <strong>not</strong> construct the value when the key already exists — unlike <code>operator[]</code> which default-constructs a value even on reads.</p>`,
      codeBlocks: [
        {
          id: 'emplace-basic',
          language: 'cpp',
          caption: 'emplace vs push_back, and try_emplace',
          code: `#include <vector>
#include <map>
#include <string>
#include <memory>

struct Heavy {
    Heavy(int x, std::string s) { /* expensive setup */ }
    Heavy(const Heavy&) = delete;  // non-copyable
};

std::vector<Heavy> v;
// v.push_back(Heavy{1, "hi"});  // ERROR — needs copy or move
v.emplace_back(1, "hi");         // ✓ constructs directly in-place

// ── Sequences ────────────────────────────────────────────
std::vector<std::string> words;
words.push_back("hello");    // constructs string, then moves — 2 steps
words.emplace_back("hello"); // constructs string in-place  — 1 step

std::deque<std::pair<int,int>> pts;
pts.emplace_front(0, 0);     // push_front + construct in-place

// ── Maps ─────────────────────────────────────────────────
std::map<std::string, std::vector<int>> m;

m.insert({"key", {1, 2, 3}});           // constructs pair first
m.emplace("key2", std::vector<int>{4});  // constructs pair in-place

// try_emplace (C++17) — only inserts if key absent
m.try_emplace("key",  42);  // no-op: "key" exists
                             // vector NOT constructed — no wasted work
m.try_emplace("new", 7, 8); // inserts: forwards (7,8) to vector ctor

// Danger of operator[] — default-constructs even on reads!
auto& ref = m["missing"];   // inserts empty vector, even if unintended
                             // try_emplace is safer for conditional inserts`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'vector::emplace_back',     complexity: 'amortized O(1)', notes: 'Fewer copies than push_back' },
          { operation: 'deque::emplace_front/back', complexity: 'O(1)' },
          { operation: 'map::emplace',             complexity: 'O(log n)' },
          { operation: 'map::try_emplace',         complexity: 'O(log n)',      notes: 'No value construction if key exists' },
          { operation: 'unordered_map::emplace',   complexity: 'O(1)',          notes: 'Average' },
        ]
      }
    },

    {
      id: 'container-choice',
      title: 'Choosing the Right Container',
      content: `
<p>A quick decision guide:</p>
<ul>
  <li><strong>Default sequence container</strong> → <code>std::vector</code>. Cache-friendly, minimal overhead.</li>
  <li><strong>Fixed size known at compile time</strong> → <code>std::array</code>. Zero heap allocation.</li>
  <li><strong>O(1) push/pop at both ends</strong> → <code>std::deque</code>. Also the backing store for <code>std::queue</code>.</li>
  <li><strong>FIFO queue</strong> → <code>std::queue</code>. Ideal for BFS, task scheduling.</li>
  <li><strong>Read-only string access, zero allocation</strong> → <code>std::string_view</code>. Use as function parameter; never store without guaranteeing lifetime.</li>
  <li><strong>Unique elements, unordered, fast lookup</strong> → <code>std::unordered_set</code>. O(1) avg membership test.</li>
  <li><strong>Unique elements, sorted or range queries</strong> → <code>std::set</code>. O(log n) guaranteed.</li>
  <li><strong>Fast keyed lookup, order doesn't matter</strong> → <code>std::unordered_map</code>. O(1) avg.</li>
  <li><strong>Sorted iteration or range queries on key-value data</strong> → <code>std::map</code>. O(log n) guaranteed.</li>
</ul>
<div class="callout tip">
  <span class="callout-icon">✓</span>
  <div class="callout-content"><p><strong>Profile before switching.</strong> <code>std::vector</code> beats theoretically better structures in practice for small-to-medium sizes due to cache effects. Measure, don't guess.</p></div>
</div>`,
      codeBlocks: [],
      diagrams: [],
    }
  ]
};
