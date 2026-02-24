var ch3 = {
  id: 3,
  slug: 'templates',
  title: 'Templates',
  description: 'Function and class templates, template specialization, variadic templates, and when templates shine vs. where they hurt — with practical examples.',
  estimatedMinutes: 13,
  tags: ['templates', 'generics', 'SFINAE', 'concepts', 'variadic', 'specialization', 'meta-programming'],

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
