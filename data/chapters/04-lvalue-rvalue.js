var ch4 = {
  id: 6,
  slug: 'lvalue-rvalue',
  title: 'Value Categories & Move Semantics',
  description: 'lvalue vs rvalue, move constructors and assignment, std::move and std::forward, perfect forwarding, and practical rules for writing efficient code.',
  level: 'advanced',
  estimatedMinutes: 18,
  tags: ['lvalue', 'rvalue', 'move semantics', 'std::move', 'std::forward', 'perfect forwarding', 'xvalue', 'universal reference'],

  sections: [
    {
      id: 'value-categories',
      title: 'Value Categories: lvalue, rvalue, xvalue',
      content: `
<p>Every C++ expression has a <em>type</em> and a <em>value category</em>. The value category determines whether the expression is addressable (has a stable identity) or temporary (can be stolen from).</p>
<ul>
  <li><strong>lvalue</strong> — Has identity, persists beyond expression. Can appear on left side of <code>=</code>. Examples: named variables, <code>*ptr</code>, function calls returning <code>T&amp;</code>.</li>
  <li><strong>prvalue</strong> (pure rvalue) — Temporary with no identity. Examples: literals (<code>42</code>, <code>3.14</code>), arithmetic expressions (<code>a+b</code>), function calls returning <code>T</code>.</li>
  <li><strong>xvalue</strong> (expiring value) — Has identity but is "expiring" — safe to move from. Created by <code>std::move()</code>, or returning a named local that qualifies for NRVO.</li>
</ul>
<p>Collectively, rvalues = prvalues + xvalues. The distinction that matters in practice: <em>can you move from this?</em></p>
<div class="callout info">
  <span class="callout-icon">ℹ</span>
  <div class="callout-content"><p><code>std::move(x)</code> does <strong>not</strong> move anything — it's a cast to <code>T&amp;&amp;</code> (an xvalue). The actual move happens if a move constructor or move assignment is selected by overload resolution.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'value-cat-examples',
          language: 'cpp',
          caption: 'Identifying lvalues and rvalues',
          code: `int x = 42;        // x is an lvalue (named, addressable)
int y = x + 1;     // (x + 1) is a prvalue (temporary)
int&  lr = x;      // OK: lvalue ref binds to lvalue
int&& rr = 42;     // OK: rvalue ref binds to prvalue
// int& bad = 42;  // ERROR: can't bind lvalue ref to rvalue

// std::move turns lvalue into xvalue (rvalue)
int&& moved = std::move(x);  // x is now "moved from" — don't use x

// Functions returning by value
std::string foo() { return "hello"; }  // return is prvalue
std::string s = foo();  // Move/copy elision (NRVO) often avoids any copy`
        }
      ],
      diagrams: [
        {
          id: 'value-cat-tree',
          type: 'ascii',
          caption: 'C++ value category taxonomy',
          content: `         expression
         /       \\
     glvalue    rvalue
     /    \\    /    \\
  lvalue  xvalue  prvalue

lvalue:  named var, *ptr, ref return
xvalue:  std::move(x), T&& function return
prvalue: 42, a+b, T{...}, T() return`
        }
      ]
    },

    {
      id: 'move-semantics',
      title: 'Move Constructors & Move Assignment',
      content: `
<p>Move semantics let you <em>steal</em> the resources of a temporary (rvalue) instead of copying them. A move constructor typically takes the source's internal pointer, sets the source to a valid empty state, and completes in O(1) — regardless of the resource's size.</p>
<p>The compiler automatically generates move constructors and move assignment operators if you don't declare any of the "Rule of Five" special functions. Once you declare any one of them, you must explicitly define (or <code>= default</code>) the rest.</p>
<div class="callout tip">
  <span class="callout-icon">✓</span>
  <div class="callout-content"><p><strong>Rule of Zero:</strong> If your class only holds RAII wrappers (smart pointers, containers, strings), don't declare any special member functions. The compiler generates correct move/copy/destructor automatically.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'move-constructor',
          language: 'cpp',
          caption: 'Move constructor and move assignment',
          code: `class Buffer {
public:
    explicit Buffer(size_t size)
        : data_(new int[size]), size_(size) {}

    // Copy constructor — O(n)
    Buffer(const Buffer& other)
        : data_(new int[other.size_]), size_(other.size_) {
        std::copy(other.data_, other.data_ + size_, data_);
    }

    // Move constructor — O(1): steal the pointer
    Buffer(Buffer&& other) noexcept
        : data_(other.data_), size_(other.size_) {
        other.data_ = nullptr;  // Leave source in valid, empty state
        other.size_ = 0;
    }

    // Move assignment — O(1)
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data_;        // Free current resource
            data_ = other.data_;   // Steal
            size_ = other.size_;
            other.data_ = nullptr;
            other.size_ = 0;
        }
        return *this;
    }

    ~Buffer() { delete[] data_; }

private:
    int*   data_;
    size_t size_;
};

Buffer a(1000);
Buffer b = std::move(a);  // Move ctor: O(1), a is now empty
// a.data_ == nullptr — don't use a without re-initializing`
        }
      ]
    },

    {
      id: 'std-move-forward',
      title: 'std::move and std::forward',
      content: `<p><code>std::move(x)</code> is an unconditional cast to <code>T&amp;&amp;</code> — it signals "I'm done with this value, transfer its resources." It does <em>zero work</em> at runtime; the actual resource transfer happens in the move constructor or move assignment that follows.</p>
<p><code>std::forward&lt;T&gt;(x)</code> is a <em>conditional</em> cast used only in generic (template) code. It preserves the original value category: lvalue in → lvalue out; rvalue in → rvalue out. Without it, named parameters are always lvalues inside a function body, silently forcing copies even when the caller passed an rvalue.</p>
<div class="callout danger">
  <span class="callout-icon">✗</span>
  <div class="callout-content"><p><strong>Don't <code>std::move</code> a return value:</strong> <code>return std::move(local);</code> disables NRVO (Named Return Value Optimization) and may be slower than a plain <code>return local;</code>. Let the compiler apply copy elision automatically.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'move-concrete-benefits',
          language: 'cpp',
          caption: 'std::move — concrete benefits with real examples',
          code: `#include <vector>
#include <string>
#include <memory>

// ── 1. Avoid copying a large container ────────────────────────
std::vector<int> load() {
    std::vector<int> v(1'000'000);
    // ... fill v ...
    return v;  // NRVO: no copy, no move — constructed in-place
}

void process(std::vector<int> data);  // takes by value (makes a copy or moves)

auto data = load();
process(data);             // ❌ copies 1 000 000 ints — O(n), expensive
process(std::move(data));  // ✓ moves in O(1), data is now empty

// ── 2. Inserting a string into a container ────────────────────
std::vector<std::string> log_entries;
std::string line = build_line();        // expensive to build, 200 chars

log_entries.push_back(line);            // copies — line still usable
log_entries.push_back(std::move(line)); // moves — line is now "", O(1)

// ── 3. Transferring unique ownership (unique_ptr) ─────────────
// unique_ptr cannot be copied — move is the ONLY way to transfer ownership
auto p1 = std::make_unique<int>(42);

// std::unique_ptr<int> p2 = p1;       // ❌ error: copy constructor is deleted
std::unique_ptr<int> p2 = std::move(p1); // ✓ p1 == nullptr, p2 owns the int

// ── 4. Sink parameter pattern — accept then move internally ───
class Config {
public:
    void set_name(std::string name) {   // caller passes copy or move
        name_ = std::move(name);        // move from parameter into member O(1)
    }
private:
    std::string name_;
};

Config cfg;
std::string n = "my_config";
cfg.set_name(n);                // caller keeps n: copies into parameter, then moves
cfg.set_name(std::move(n));     // caller gives up n: moves into parameter, then moves
cfg.set_name("default");        // literal: constructed in-place, then moves`
        },
        {
          id: 'forward-why-needed',
          language: 'cpp',
          caption: 'std::forward — why it is needed and how to use it',
          code: `#include <string>
#include <iostream>

// Target has two overloads — copy and move
void store(const std::string& s) { std::cout << "copy: " << s << '\\n'; }
void store(std::string&& s)      { std::cout << "move: " << s << '\\n'; }

// ── WITHOUT std::forward — value category is always lost ─────
template<typename T>
void bad_wrap(T&& arg) {
    // 'arg' is always an lvalue here — named parameters always are
    store(arg);  // always calls the copy overload!
}

std::string s = "hello";
bad_wrap(s);             // copy: hello  ✓ correct (expected copy)
bad_wrap(std::move(s));  // copy: hello  ❌ wrong! rvalue became lvalue

// ── WITH std::forward — category is preserved ─────────────────
template<typename T>
void wrap(T&& arg) {              // T&& = forwarding reference (not just rvalue ref)
    store(std::forward<T>(arg));  // if T=string&  → forward as lvalue → copy overload
}                                 // if T=string   → forward as rvalue → move overload

std::string t = "world";
wrap(t);              // T=string&  → store gets lvalue  → "copy: world" ✓
wrap(std::move(t));   // T=string   → store gets rvalue  → "move: world" ✓
wrap("temp");         // T=string   → store gets rvalue  → "move: temp"  ✓

// ── Real-world: forwarding to a constructor ───────────────────
// This is what std::make_unique / emplace_back do internally:
template<typename T, typename... Args>
std::unique_ptr<T> make(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
    //                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //  Each arg forwarded with its original value category preserved
}`
        }
      ]
    },

    {
      id: 'move-practical',
      title: 'Practical Guidelines',
      content: `
<p>Summary of move-semantic rules that apply every day:</p>
<ol>
  <li><strong>Return locals by value</strong> — compilers apply NRVO; no explicit move needed.</li>
  <li><strong>Pass sink parameters by value</strong> — the function receives either a copy (lvalue) or a moved value (rvalue), then moves from its parameter internally.</li>
  <li><strong>Use <code>std::move</code> for explicit ownership transfer</strong> — e.g., pushing into a container, storing in a member.</li>
  <li><strong>Mark move constructors/assignment <code>noexcept</code></strong> — containers (like <code>vector::resize</code>) prefer move over copy only if move is noexcept. Without it, you lose the move benefit!</li>
  <li><strong>Don't use a moved-from object</strong> — it's in a valid but unspecified state. Re-assign before reuse.</li>
</ol>`,
      codeBlocks: [
        {
          id: 'move-patterns',
          language: 'cpp',
          caption: 'Common move patterns in practice',
          code: `// Pattern 1: Sink parameter (accept by value, move internally)
class Processor {
public:
    void setName(std::string name) {    // Caller moves or copies into 'name'
        name_ = std::move(name);        // Move from parameter into member
    }
private:
    std::string name_;
};

// Pattern 2: Push into container
std::vector<std::string> v;
std::string s = computeString();
v.push_back(std::move(s));  // Move — avoids copy; s is now ""

// Pattern 3: noexcept move constructor allows vector to move on resize
class MyClass {
public:
    MyClass(MyClass&& other) noexcept { /* ... */ }       // noexcept = vector uses move
    MyClass& operator=(MyClass&&) noexcept = default;     // on resize!
};

// Pattern 4: Return value — do NOT move
std::string buildString() {
    std::string result;
    result += "hello";
    return result;  // NRVO applies — NOT: return std::move(result);
}`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'Copy string/vector of n elements', complexity: 'O(n)' },
          { operation: 'Move string/vector',               complexity: 'O(1)', notes: 'Pointer swap' },
          { operation: 'std::move() cast',                 complexity: 'O(1)', notes: 'Zero cost, just a cast' },
          { operation: 'NRVO (copy elision)',              complexity: 'O(1)', notes: 'No copy or move at all' },
        ]
      }
    }
  ]
};
