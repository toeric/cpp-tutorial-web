var ch3 = {
  id: 3,
  slug: 'templates',
  title: 'Templates',
  description: 'Function and class templates, template specialization, variadic templates, and when templates shine vs. where they hurt — with practical examples.',
  level: 'basic',
  estimatedMinutes: 17,
  tags: ['templates', 'generics', 'type deduction', 'CTAD', 'concepts', 'variadic', 'fold expression', 'specialization', 'meta-programming'],

  sections: [
    {
      id: 'function-templates',
      title: 'Function Templates',
      content: `
<p>A function template is a blueprint. When you call it with specific types, the compiler <em>instantiates</em> a concrete function for those types — no runtime overhead, fully inlinable.</p>
<p>Type deduction eliminates most explicit <code>&lt;Type&gt;</code> annotations. The compiler infers template parameters from the function arguments.</p>
<div class="callout info">
  <span class="callout-icon">ℹ</span>
  <div class="callout-content"><p>Templates are compiled per translation unit. Template definitions (not just declarations) must be visible at the point of use — keep them in header files or inline in the class body.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'func-template-basic',
          language: 'cpp',
          caption: 'Function template: type deduction + explicit specialization',
          code: `// T is deduced from arguments
template<typename T>
T max_val(T a, T b) {
    return (a > b) ? a : b;
}

max_val(3, 5);         // T = int   (deduced)
max_val(3.0, 5.0);    // T = double (deduced)
max_val<int>(3, 5);   // T = int   (explicit)

// Multiple type parameters
template<typename T, typename U>
auto add(T a, U b) -> decltype(a + b) {
    return a + b;
}

// Constrained with concepts (C++20)
template<typename T>
requires std::integral<T>
T gcd(T a, T b) {
    while (b) { a %= b; std::swap(a, b); }
    return a;
}

// Equivalent shorthand (C++20)
auto gcd2(std::integral auto a, std::integral auto b) {
    while (b) { a %= b; std::swap(a, b); }
    return a;
}`
        },
        {
          id: 'func-template-specialization',
          language: 'cpp',
          caption: 'Full specialization for a specific type',
          code: `template<typename T>
std::string to_str(T val) {
    return std::to_string(val);
}

// Full specialization for bool
template<>
std::string to_str<bool>(bool val) {
    return val ? "true" : "false";
}

to_str(42);     // → "42"
to_str(true);   // → "true"  (uses specialization)`
        }
      ]
    },

    {
      id: 'template-deduction',
      title: 'Template Type Deduction',
      content: `<p>Type deduction happens at the <strong>call site</strong>, every time a template function is called with concrete arguments. The compiler pattern-matches each argument's type against the parameter pattern to determine what T (or other type parameters) must be.</p>
<h3>The basic rules</h3>
<ul>
  <li>The compiler deduces T from function <em>arguments</em>, not from the return type.</li>
  <li>Each argument that involves T must agree on the same T — conflicting deductions are an error.</li>
  <li>References and top-level <code>const</code> are stripped when deducing T (so <code>const int&</code> deduces T = <code>int</code>, not <code>const int</code>).</li>
  <li>T in a <em>non-deducible context</em> (return type only, or nested inside <code>Container&lt;T&gt;::value_type</code>) cannot be deduced — you must specify it explicitly.</li>
</ul>
<h3>C++17 — Class Template Argument Deduction (CTAD)</h3>
<p>Before C++17 you had to spell out type arguments when constructing class templates. CTAD lets the compiler deduce them from the constructor arguments, just like function templates:</p>
<div class="callout tip">
  <span class="callout-icon">✓</span>
  <div class="callout-content"><p>Use CTAD to reduce boilerplate: <code>std::pair p{1, 2.5}</code> instead of <code>std::pair&lt;int, double&gt; p{1, 2.5}</code>. Works for <code>std::vector</code>, <code>std::optional</code>, <code>std::lock_guard</code>, and any class with appropriate deduction guides.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'deduction-rules',
          language: 'cpp',
          caption: 'When deduction works and when it fails',
          code: `// ── Basic deduction from argument type ───────────────────────
template<typename T>
void show(T val) { /* ... */ }

show(42);         // T = int         (from int literal)
show(3.14);       // T = double      (from double literal)
show("hello");    // T = const char* (from string literal)

// ── References: T deduces to the underlying type ─────────────
template<typename T>
void by_ref(const T& val) { /* ... */ }

int x = 5;
by_ref(x);   // T = int  (not int& — ref-ness stripped from T)
by_ref(42);  // T = int  (rvalue binds to const T&)

// ── Conflicting deductions — compile error ────────────────────
template<typename T>
T max_val(T a, T b) { return (a > b) ? a : b; }

max_val(3, 5);          // OK:  T = int
max_val(3.0, 5.0);      // OK:  T = double
// max_val(3, 5.0);     // ❌  T can't be both int and double
max_val<double>(3, 5.0); // ✓  explicit arg resolves conflict; int → double

// ── Non-deducible: T only in return type ─────────────────────
template<typename T>
T zero() { return T{}; }

// zero();          // ❌ can't deduce T from return type alone
zero<int>();        // ✓
zero<std::string>(); // ✓`
        },
        {
          id: 'ctad-examples',
          language: 'cpp',
          caption: 'C++17 CTAD — class template argument deduction',
          code: `#include <vector>
#include <utility>
#include <optional>
#include <mutex>

// Before C++17 — must spell out all type arguments
std::pair<int, double>          p1{1, 2.5};
std::vector<std::string>        v1{"hello", "world"};
std::optional<int>              o1{42};
std::lock_guard<std::mutex>     lk1{mtx};

// C++17 CTAD — compiler deduces from constructor arguments
std::pair   p2{1, 2.5};          // deduced: pair<int, double>
std::vector v2{"hello"s, "world"s}; // deduced: vector<string>
std::optional o2{42};             // deduced: optional<int>
std::lock_guard lk2{mtx};         // deduced: lock_guard<std::mutex>

// ── Deduction guides — how CTAD knows what to infer ──────────
// The standard library ships deduction guides for its templates.
// You can write your own for custom class templates:

template<typename T>
struct Wrapper { T value; };

// Custom deduction guide
template<typename T>
Wrapper(T) -> Wrapper<T>;

Wrapper w{42};      // deduced: Wrapper<int>
Wrapper w2{3.14};   // deduced: Wrapper<double>`
        }
      ]
    },

    {
      id: 'class-templates',
      title: 'Class Templates',
      content: `
<p>Class templates generate type-safe, reusable data structures and algorithms. <code>std::vector</code>, <code>std::optional</code>, <code>std::pair</code> — the entire STL is built on class templates.</p>
<p>Member functions of class templates are themselves templates instantiated on demand — only functions that are actually called get compiled into the binary.</p>`,
      codeBlocks: [
        {
          id: 'class-template-basic',
          language: 'cpp',
          caption: 'Class template: generic Stack',
          code: `template<typename T>
class Stack {
public:
    void push(const T& val) { data_.push_back(val); }
    void push(T&& val)      { data_.push_back(std::move(val)); }

    T pop() {
        if (empty()) throw std::underflow_error("Stack empty");
        T top = std::move(data_.back());
        data_.pop_back();
        return top;
    }

    const T& peek() const {
        if (empty()) throw std::underflow_error("Stack empty");
        return data_.back();
    }

    bool   empty() const { return data_.empty(); }
    size_t size()  const { return data_.size(); }

private:
    std::vector<T> data_;
};

Stack<int>         intStack;
Stack<std::string> strStack;

intStack.push(42);
strStack.push("hello");

// Partial specialization — e.g., Stack<bool> could use bitset for storage`
        },
        {
          id: 'class-template-nontype',
          language: 'cpp',
          caption: 'Non-type template parameter (compile-time value)',
          code: `// N is a compile-time size constant
template<typename T, std::size_t N>
class RingBuffer {
public:
    void push(T val) {
        buf_[head_] = std::move(val);
        head_ = (head_ + 1) % N;
        if (count_ < N) ++count_;
    }

    std::size_t size() const { return count_; }

private:
    std::array<T, N> buf_{};  // Stack-allocated, size N
    std::size_t head_ = 0, count_ = 0;
};

RingBuffer<int, 8> rb;   // 8-element ring, entirely on the stack`
        }
      ]
    },

    {
      id: 'variadic-templates',
      title: 'Variadic Templates',
      content: `
<p>Variadic templates accept an arbitrary number of type arguments (a <em>parameter pack</em>). They power <code>std::tuple</code>, <code>std::make_unique</code>, <code>std::forward</code>, and most modern generic utilities.</p>
<p>The <code>...</code> syntax works in three positions: pack declaration, pack expansion, and <code>sizeof...(pack)</code> to get the count.</p>`,
      codeBlocks: [
        {
          id: 'variadic-basic',
          language: 'cpp',
          caption: 'Variadic template: type-safe print and sum',
          code: `// Base case (empty pack)
void print() { std::cout << '\\n'; }

// Recursive variadic template
template<typename T, typename... Rest>
void print(const T& first, const Rest&... rest) {
    std::cout << first << ' ';
    print(rest...);  // Recursive call with remaining pack
}

print(1, 3.14, "hello", true);
// → 1 3.14 hello 1

// C++17 fold expression — much cleaner!
template<typename... Ts>
auto sum(Ts... args) {
    return (args + ...);   // Unary right fold: ((a + b) + c) + ...
}

sum(1, 2, 3, 4);   // → 10
sum(1.0, 2.5, 3);  // → 6.5

// sizeof... — count args at compile time
template<typename... Ts>
constexpr std::size_t count() { return sizeof...(Ts); }
count<int, double, char>();  // → 3`
        }
      ]
    },

    {
      id: 'template-tradeoffs',
      title: 'Template Trade-offs',
      content: `
<p>Templates give you zero-cost abstraction — the generated code is as efficient as hand-written type-specific code. But they come with real costs:</p>
<ul>
  <li><strong>Code bloat:</strong> Each instantiation generates a separate function/class. <code>sort&lt;int*&gt;</code> and <code>sort&lt;double*&gt;</code> are distinct binary functions.</li>
  <li><strong>Compile time:</strong> Heavy template use (especially recursive/variadic) can dramatically slow compilation.</li>
  <li><strong>Error messages:</strong> Template errors are notoriously verbose before C++20 Concepts.</li>
  <li><strong>Debugging:</strong> Template instantiation stack traces are hard to follow.</li>
</ul>
<p>Mitigations:</p>
<ul>
  <li>Use <strong>explicit instantiation</strong> (<code>template class Stack&lt;int&gt;;</code>) in .cpp files to avoid repeated re-instantiation.</li>
  <li>Use <strong>Concepts</strong> (C++20) to constrain templates and get readable error messages.</li>
  <li>Prefer <strong>type erasure</strong> (<code>std::any</code>, <code>std::function</code>, virtual) when compile-time types aren't needed.</li>
</ul>
<div class="callout warning">
  <span class="callout-icon">⚠</span>
  <div class="callout-content"><p><strong>Template definitions in headers:</strong> Because instantiation happens at call sites, the full template definition must be in a header. This increases compilation coupling — a change to the template recompiles every TU that includes the header.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'concepts-example',
          language: 'cpp',
          caption: 'C++20 Concepts — readable constraints and errors',
          code: `#include <concepts>

// Concept: T must support operator+ and be copyable
template<typename T>
concept Addable = requires(T a, T b) {
    { a + b } -> std::convertible_to<T>;
};

template<Addable T>
T add(T a, T b) { return a + b; }

add(1, 2);        // OK
add("x", "y");    // Compile error: "x" doesn't satisfy Addable
                  // Error message names the concept — much clearer!

// Standard concepts (C++20 <concepts>)
std::integral<int>          // true for integer types
std::floating_point<double>
std::copyable<std::string>
std::invocable<F, Args...>  // callable with Args`
        }
      ]
    }
  ]
};
