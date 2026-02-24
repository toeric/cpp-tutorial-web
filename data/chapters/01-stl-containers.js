var ch1 = {
  id: 1,
  slug: 'stl-containers',
  title: 'STL Containers',
  description: 'Core sequence and associative containers: vector, array, string, map, unordered_map — when to use each and how they work under the hood.',
  estimatedMinutes: 12,
  tags: ['vector', 'array', 'string', 'map', 'unordered_map', 'STL', 'containers'],

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
      id: 'container-choice',
      title: 'Choosing the Right Container',
      content: `
<p>A quick decision guide:</p>
<ul>
  <li><strong>Default sequence container</strong> → <code>std::vector</code>. Cache-friendly, minimal overhead.</li>
  <li><strong>Fixed size known at compile time</strong> → <code>std::array</code>. Zero heap allocation.</li>
  <li><strong>Fast keyed lookup, order doesn't matter</strong> → <code>std::unordered_map</code>. O(1) avg.</li>
  <li><strong>Sorted iteration or range queries</strong> → <code>std::map</code>. O(log n) guaranteed.</li>
  <li><strong>Fast front/back insert+delete, no random access</strong> → <code>std::deque</code>.</li>
  <li><strong>Unique sorted elements</strong> → <code>std::set</code> / <code>std::unordered_set</code>.</li>
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
