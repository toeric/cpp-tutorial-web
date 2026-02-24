var ch4 = {
  id: 4,
  slug: 'lvalue-rvalue',
  title: 'Value Categories & Move Semantics',
  description: 'lvalue vs rvalue, move constructors and assignment, std::move and std::forward, perfect forwarding, and practical rules for writing efficient code.',
  estimatedMinutes: 14,
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
      content: `
<p><code>std::move(x)</code> casts <code>x</code> to <code>T&amp;&amp;</code> — it's an unconditional "I'm done with this, please move it." Use it when you explicitly want to transfer ownership from a named variable.</p>
<p><code>std::forward&lt;T&gt;(x)</code> is a <em>conditional</em> cast used in generic code (perfect forwarding). It preserves the original value category: if the caller passed an lvalue, forward passes an lvalue; if the caller passed an rvalue, forward passes an rvalue.</p>
<div class="callout danger">
  <span class="callout-icon">✗</span>
  <div class="callout-content"><p><strong>Don't std::move a return value:</strong> <code>return std::move(local);</code> prevents NRVO (Named Return Value Optimization) and may be slower than plain <code>return local;</code>. Let the compiler apply copy elision automatically.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'perfect-forwarding',
          language: 'cpp',
          caption: 'Perfect forwarding with std::forward',
          code: `// Without perfect forwarding — forces a copy for lvalues
template<typename T>
void wrapper_bad(T val) {
    target(val);  // Always copies
}

// With perfect forwarding — preserves value category
template<typename T>
void wrapper(T&& arg) {           // T&& is a "universal reference" (forwarding ref)
    target(std::forward<T>(arg)); // Forwards as lvalue or rvalue, matching caller
}

void target(const std::string& s) { /* copy version */ }
void target(std::string&& s)      { /* move version */ }

std::string s = "hello";
wrapper(s);             // T = string& → target gets lvalue ref (no copy)
wrapper("world");       // T = string  → target gets rvalue ref (move)
wrapper(std::move(s));  // T = string  → target gets rvalue ref (move)

// make_unique uses perfect forwarding internally:
// template<typename T, typename... Args>
// unique_ptr<T> make_unique(Args&&... args) {
//     return unique_ptr<T>(new T(std::forward<Args>(args)...));
// }`
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
