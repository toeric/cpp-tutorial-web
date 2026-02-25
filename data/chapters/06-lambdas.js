var ch6 = {
  id: 4,
  slug: 'lambdas',
  title: 'Lambda Expressions & std::function',
  description: 'Anonymous function objects (closures), capture mechanics, std::function type erasure, higher-order functions with STL algorithms, and practical guidelines for modern functional-style C++.',
  level: 'basic',
  estimatedMinutes: 16,
  tags: ['lambda', 'closure', 'capture', 'std::function', 'std::bind', 'higher-order functions', 'callable', 'generic lambda', 'mutable'],

  sections: [
    {
      id: 'lambda-basics',
      title: 'Lambda Syntax & Captures',
      content: `
<p>A <strong>lambda expression</strong> is an anonymous function object — a closure — that you define inline at the point of use. Under the hood the compiler generates a unique class with an <code>operator()</code>; the lambda syntax is just convenient shorthand.</p>

<h3>Anatomy of a Lambda</h3>
<pre class="language-text"><code>[capture](parameters) -&gt; ReturnType { body }</code></pre>
<ul>
  <li><strong>Capture clause <code>[...]</code></strong> — which variables from the enclosing scope the lambda can see</li>
  <li><strong>Parameter list</strong> — just like a normal function (optional if empty)</li>
  <li><strong>Return type <code>-&gt; T</code></strong> — almost always omitted; the compiler deduces it</li>
  <li><strong>Body</strong> — regular function body</li>
</ul>

<h3>Capture Modes</h3>
<table class="complexity-table">
  <thead><tr><th>Capture</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><code>[]</code></td><td>No captures — lambda cannot reference any local variable</td></tr>
    <tr><td><code>[=]</code></td><td>Copy all used locals <em>by value</em> at the moment the lambda is created</td></tr>
    <tr><td><code>[&amp;]</code></td><td>Capture all used locals <em>by reference</em> — fast but see lifetime pitfalls</td></tr>
    <tr><td><code>[x, &amp;y]</code></td><td>Explicit: <code>x</code> by value, <code>y</code> by reference</td></tr>
    <tr><td><code>[=, &amp;y]</code></td><td>All by value except <code>y</code> by reference</td></tr>
    <tr><td><code>[this]</code></td><td>Capture the current object's <code>this</code> pointer (member access)</td></tr>
    <tr><td><code>[*this]</code></td><td>C++17: capture a copy of the whole object</td></tr>
  </tbody>
</table>

<div class="callout info">
  <span class="callout-icon">ℹ</span>
  <div class="callout-content"><p>Prefer explicit captures (<code>[x]</code>, <code>[&amp;x]</code>) over blanket <code>[=]</code> or <code>[&amp;]</code>. Explicit captures make it obvious what the lambda depends on and prevent accidentally copying large objects or dangling references.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'lambda-basics-code',
          language: 'cpp',
          caption: 'Lambda syntax, captures, and common uses',
          code: `#include <vector>
#include <algorithm>
#include <iostream>

int main() {
    // ── No capture ────────────────────────────────────────
    auto square = [](int x) { return x * x; };
    std::cout << square(5);  // 25

    // ── Capture by value ──────────────────────────────────
    int threshold = 10;
    auto above = [threshold](int x) { return x > threshold; };
    // threshold captured as a copy — changes later don't affect above()

    // ── Capture by reference ──────────────────────────────
    int count = 0;
    auto inc = [&count]() { ++count; };
    inc(); inc();
    std::cout << count;  // 2

    // ── Sorting with a custom comparator ──────────────────
    std::vector<std::string> words = {"banana", "apple", "cherry"};
    std::sort(words.begin(), words.end(),
        [](const std::string& a, const std::string& b) {
            return a.length() < b.length();  // sort by length
        });

    // ── Filter: erase-remove idiom ────────────────────────
    std::vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8};
    nums.erase(
        std::remove_if(nums.begin(), nums.end(),
            [](int x) { return x % 2 == 0; }),  // remove evens
        nums.end()
    );
    // nums = {1, 3, 5, 7}

    // ── Immediate invocation (IIFE) ───────────────────────
    int result = [](int a, int b) { return a + b; }(3, 4);
    // result = 7

    // ── Return type deduction ─────────────────────────────
    auto divide = [](double a, double b) -> double {
        if (b == 0.0) return 0.0;
        return a / b;
    };
}`
        }
      ]
    },

    {
      id: 'lambda-captures-lifetime',
      title: 'Capture Pitfalls & Lifetime',
      content: `
<p>Lambda captures look simple but have subtle rules that cause bugs in real code. Understanding <em>when</em> values are captured and <em>how long</em> references remain valid is essential.</p>

<h3>By-Value = Snapshot at Creation Time</h3>
<p>When you capture <code>x</code> by value, the lambda gets a <strong>copy made at the lambda's construction site</strong>. Later mutations to the original variable do not affect the lambda's copy.</p>

<h3>The <code>mutable</code> Keyword</h3>
<p>By default, a by-value capture is <code>const</code> inside the lambda body. To modify the internal copy, declare the lambda <code>mutable</code>:</p>
<pre class="language-cpp"><code>int n = 0;
auto counter = [n]() mutable { return ++n; };
counter();  // returns 1
counter();  // returns 2
std::cout &lt;&lt; n;  // still 0 — the original is untouched</code></pre>
<p>Each call mutates the lambda's private copy of <code>n</code>, not the outer variable.</p>

<h3>Dangling Reference — The Classic Bug</h3>
<p>Capturing by reference (<code>[&amp;]</code> or <code>[&amp;x]</code>) is only safe while the referenced variable is alive. If you <strong>store the lambda</strong> beyond the lifetime of the local variable, you have <strong>undefined behaviour</strong>.</p>

<div class="callout warning">
  <span class="callout-icon">⚠</span>
  <div class="callout-content"><p><strong>Lifetime rule:</strong> A lambda that captures by reference must not outlive the variables it references. This commonly bites when returning a lambda from a function or storing it in a member variable.</p></div>
</div>

<h3>Capturing <code>this</code></h3>
<p>Inside a member function, <code>[this]</code> gives access to member variables and functions. But if the lambda outlives the object (e.g. stored in a callback registry after the object is destroyed), the <code>this</code> pointer dangles. Prefer <code>[*this]</code> (C++17) to capture a copy of the object when the lambda may outlive it.</p>`,
      codeBlocks: [
        {
          id: 'lambda-captures-lifetime-code',
          language: 'cpp',
          caption: 'Capture snapshots, mutable, and dangling reference',
          code: `#include <functional>
#include <iostream>

// ── By-value snapshot ─────────────────────────────────────
void demo_snapshot() {
    int x = 5;
    auto f = [x]() { return x; };  // x copied as 5
    x = 100;
    std::cout << f();   // still 5 — not 100
}

// ── mutable: modify the internal copy ─────────────────────
void demo_mutable() {
    int n = 0;
    auto counter = [n]() mutable {
        return ++n;   // modifies lambda's own copy
    };
    std::cout << counter();  // 1
    std::cout << counter();  // 2
    std::cout << n;          // 0 — original unchanged
}

// ── Dangling reference (UB!) ──────────────────────────────
std::function<int()> make_dangling() {
    int local = 42;
    return [&local]() { return local; };  // ← UB: local destroyed on return
}

// ── Safe: capture by value instead ───────────────────────
std::function<int()> make_safe() {
    int local = 42;
    return [local]() { return local; };   // OK: copy survives
}

// ── Capturing this ────────────────────────────────────────
struct Widget {
    int value = 10;

    std::function<int()> get_getter_unsafe() {
        return [this]() { return value; };  // dangerous if Widget destroyed
    }

    std::function<int()> get_getter_safe() {
        return [*this]() { return value; }; // C++17: copy of Widget captured
    }
};`
        }
      ]
    },

    {
      id: 'std-function',
      title: 'std::function & Type Erasure',
      content: `
<p><code>std::function&lt;R(Args...)&gt;</code> is a <strong>type-erased callable wrapper</strong>. It can hold any callable whose signature matches: a lambda, a free function, a functor (object with <code>operator()</code>), or a bound member function.</p>

<h3>What Type Erasure Means</h3>
<p>Every lambda has a <em>unique, compiler-generated type</em>. You cannot put two different lambdas in a <code>std::vector</code> because they are different types — even if their signatures match. <code>std::function</code> erases the concrete type, letting you store, copy, and call heterogeneous callables uniformly.</p>

<h3>The Cost</h3>
<p><code>std::function</code> is <strong>not zero-cost</strong>:</p>
<ul>
  <li><strong>Heap allocation</strong> — if the stored callable is larger than a small-buffer threshold (typically 16–32 bytes), <code>std::function</code> heap-allocates it.</li>
  <li><strong>Indirect call</strong> — virtual-dispatch-like indirection at each invocation; the compiler cannot inline through it.</li>
  <li><strong>No noexcept</strong> — <code>std::function::operator()</code> is never <code>noexcept</code>.</li>
</ul>

<h3>When to Use <code>auto</code> Instead</h3>
<p>If you are just storing a single lambda locally and don't need to erase its type, use <code>auto</code>. The compiler knows the exact type and can inline the call:</p>
<pre class="language-cpp"><code>auto f = [](int x) { return x * 2; };  // zero overhead — type known
std::function&lt;int(int)&gt; g = f;         // type erased — overhead</code></pre>

<div class="callout info">
  <span class="callout-icon">ℹ</span>
  <div class="callout-content"><p><strong>Rule of thumb:</strong> Use <code>std::function</code> at <em>API boundaries</em> where callers need to supply heterogeneous callables (callbacks, event handlers, plugin systems). Use <code>auto</code> internally where the type is known at the point of declaration.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'std-function-code',
          language: 'cpp',
          caption: 'std::function as a callback and heterogeneous container',
          code: `#include <functional>
#include <vector>
#include <iostream>
#include <string>

// ── API boundary: accepts any callable matching void(int) ──
class Button {
    std::function<void(int)> on_click_;
public:
    void set_on_click(std::function<void(int)> cb) {
        on_click_ = std::move(cb);
    }
    void click(int x) {
        if (on_click_) on_click_(x);
    }
};

void free_handler(int x) {
    std::cout << "free: " << x << '\n';
}

struct Functor {
    void operator()(int x) const {
        std::cout << "functor: " << x << '\n';
    }
};

void demo_callbacks() {
    Button b;

    b.set_on_click(free_handler);               // free function
    b.click(1);

    b.set_on_click(Functor{});                  // functor
    b.click(2);

    b.set_on_click([](int x) {                  // lambda
        std::cout << "lambda: " << x << '\n';
    });
    b.click(3);
}

// ── Heterogeneous callable collection ─────────────────────
void demo_vector() {
    std::vector<std::function<std::string(int)>> transforms;

    transforms.push_back([](int x) { return std::to_string(x); });
    transforms.push_back([](int x) { return std::to_string(x * x); });
    transforms.push_back([](int x) { return "hex=" + std::to_string(x); });

    for (auto& fn : transforms)
        std::cout << fn(7) << '\n';
    // 7
    // 49
    // hex=7
}

// ── Prefer auto internally ─────────────────────────────────
void prefer_auto() {
    // Good: compiler can inline, no heap
    auto double_it = [](int x) { return x * 2; };

    // Avoid: overhead with no benefit here
    std::function<int(int)> boxed = [](int x) { return x * 2; };
}`
        }
      ]
    },

    {
      id: 'higher-order-functions',
      title: 'Higher-Order Functions & STL',
      content: `
<p>A <strong>higher-order function</strong> is a function that either accepts another function as an argument or returns a function. Lambdas make this natural in C++.</p>

<h3>STL Algorithms + Lambdas</h3>
<p>The STL algorithm library was designed for this pattern. Lambdas replace hand-written comparators and predicates cleanly:</p>
<table class="complexity-table">
  <thead><tr><th>Algorithm</th><th>Common Lambda Role</th></tr></thead>
  <tbody>
    <tr><td><code>std::sort</code></td><td>Custom comparator — sort by field, descending, etc.</td></tr>
    <tr><td><code>std::find_if</code></td><td>Predicate — find first element matching a condition</td></tr>
    <tr><td><code>std::transform</code></td><td>Mapper — convert each element to another value</td></tr>
    <tr><td><code>std::for_each</code></td><td>Consumer — apply side-effect to each element</td></tr>
    <tr><td><code>std::count_if</code></td><td>Predicate — count elements satisfying a condition</td></tr>
    <tr><td><code>std::remove_if</code></td><td>Predicate — mark elements for erasure</td></tr>
  </tbody>
</table>

<h3>Lambda Factories (Returning a Lambda)</h3>
<p>A function can return a lambda, creating a <strong>factory</strong> or <strong>generator</strong>. Each call to the factory produces a new lambda with its own captured state:</p>
<pre class="language-cpp"><code>auto make_multiplier(int factor) {
    return [factor](int x) { return x * factor; };
}
auto triple = make_multiplier(3);
triple(5);  // 15</code></pre>

<h3>Generic Lambdas (C++14)</h3>
<p>Using <code>auto</code> parameters makes a lambda a <em>template</em> — the compiler instantiates a new <code>operator()</code> for each argument type:</p>
<pre class="language-cpp"><code>auto add = [](auto x, auto y) { return x + y; };
add(1, 2);       // int + int
add(1.5, 2.5);   // double + double
add(std::string("hello"), std::string(" world"));</code></pre>`,
      codeBlocks: [
        {
          id: 'higher-order-functions-code',
          language: 'cpp',
          caption: 'STL algorithms, lambda factories, generic lambdas, and a filter→transform→accumulate pipeline',
          code: `#include <vector>
#include <algorithm>
#include <numeric>
#include <string>
#include <iostream>

// ── STL algorithm examples ─────────────────────────────────
void stl_demos() {
    std::vector<int> v = {5, 2, 8, 1, 9, 3, 7, 4, 6};

    // Sort descending
    std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });

    // Find first element > 6
    auto it = std::find_if(v.begin(), v.end(), [](int x) { return x > 6; });
    if (it != v.end()) std::cout << *it;  // 9

    // Transform: square every element
    std::vector<int> sq(v.size());
    std::transform(v.begin(), v.end(), sq.begin(), [](int x) { return x * x; });

    // Count how many are odd
    int odds = std::count_if(v.begin(), v.end(), [](int x) { return x % 2 != 0; });
    std::cout << odds;  // e.g. 5
}

// ── Lambda factory ─────────────────────────────────────────
auto make_multiplier(int factor) {
    return [factor](int x) { return x * factor; };
}

auto make_range_check(int lo, int hi) {
    return [lo, hi](int x) { return x >= lo && x <= hi; };
}

// ── Generic lambda (C++14) ─────────────────────────────────
auto add = [](auto x, auto y) { return x + y; };

// ── Practical pipeline: filter → transform → accumulate ───
void pipeline_demo() {
    std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

    // Step 1: filter — keep only even numbers
    std::vector<int> evens;
    std::copy_if(data.begin(), data.end(), std::back_inserter(evens),
        [](int x) { return x % 2 == 0; });
    // evens = {2, 4, 6, 8, 10}

    // Step 2: transform — square each even
    std::vector<int> squared(evens.size());
    std::transform(evens.begin(), evens.end(), squared.begin(),
        [](int x) { return x * x; });
    // squared = {4, 16, 36, 64, 100}

    // Step 3: accumulate — sum them up
    int total = std::accumulate(squared.begin(), squared.end(), 0,
        [](int acc, int x) { return acc + x; });
    std::cout << total;  // 220

    // With multiplier factory
    auto double_it = make_multiplier(2);
    auto in_range  = make_range_check(3, 8);

    std::vector<int> result;
    for (int x : data) {
        if (in_range(x)) result.push_back(double_it(x));
    }
    // result = {6, 8, 10, 12, 14, 16}
}`
        }
      ]
    },

    {
      id: 'lambda-guidelines',
      title: 'When to Use What',
      content: `
<p>Lambdas, <code>std::function</code>, named functions, and <code>std::bind</code> each have a place. Here are concrete guidelines.</p>

<h3>Lambda vs Named Function</h3>
<table class="complexity-table">
  <thead><tr><th>Situation</th><th>Prefer</th></tr></thead>
  <tbody>
    <tr><td>Short, single-use logic next to its call site</td><td>Lambda</td></tr>
    <tr><td>Reused in multiple places or across files</td><td>Named function</td></tr>
    <tr><td>Needs captures from surrounding scope</td><td>Lambda</td></tr>
    <tr><td>Called recursively</td><td>Named function (lambdas can't self-refer easily)</td></tr>
    <tr><td>Complex, large, or deserves documentation</td><td>Named function</td></tr>
  </tbody>
</table>

<h3>Generic Lambda vs Function Template</h3>
<p>A generic lambda <code>[](auto x)</code> is essentially a local function template. Use it for short in-place polymorphic logic. Use a named function template when the logic is complex, reused widely, or needs explicit template constraints (C++20 concepts).</p>

<h3>Avoid Large <code>[=]</code> Captures</h3>
<p>A blanket <code>[=]</code> silently copies every local variable the lambda references. With large objects (big vectors, strings) this is an invisible copy. Prefer explicit captures: <code>[x, y]</code> — it's clear exactly what is captured and avoids unintentional copies.</p>

<h3>std::function — API Boundaries Only</h3>
<p>Use <code>std::function</code> when you need to store or pass callables whose type is unknown at compile time — callbacks, event systems, plugin hooks. Avoid it on hot paths or internal helpers where <code>auto</code> works fine and the compiler can inline.</p>

<h3>std::bind Is Obsolete</h3>
<p><code>std::bind</code> pre-dates lambdas and produces unreadable, hard-to-debug code. Lambdas replace it entirely:</p>
<pre class="language-cpp"><code>// Old style (avoid)
auto old = std::bind(my_func, std::placeholders::_1, 42);

// Modern (prefer)
auto modern = [](int x) { return my_func(x, 42); };</code></pre>

<div class="callout info">
  <span class="callout-icon">ℹ</span>
  <div class="callout-content">
    <p><strong>Summary rules:</strong></p>
    <ul>
      <li>Use <code>auto</code> to store a lambda locally — zero cost, inlineable.</li>
      <li>Use <code>std::function</code> only at API/callback boundaries.</li>
      <li>Capture explicitly; avoid blanket <code>[=]</code> for large objects.</li>
      <li>Prefer lambdas over <code>std::bind</code> in all new code.</li>
      <li>Use generic lambdas (<code>auto</code> params) for short polymorphic helpers.</li>
    </ul>
  </div>
</div>`,
      codeBlocks: [
        {
          id: 'lambda-guidelines-code',
          language: 'cpp',
          caption: 'Guidelines in practice',
          code: `#include <functional>
#include <algorithm>
#include <vector>
#include <string>

// ── Named function: reused logic, not inline ──────────────
bool is_palindrome(const std::string& s) {
    return std::equal(s.begin(), s.begin() + s.size() / 2, s.rbegin());
}

// ── Lambda: local, single-use predicate ───────────────────
void sort_demo(std::vector<std::string>& words) {
    std::sort(words.begin(), words.end(),
        [](const std::string& a, const std::string& b) {
            return a.length() < b.length();
        });
}

// ── std::function: API boundary ───────────────────────────
class EventBus {
    std::vector<std::function<void(const std::string&)>> listeners_;
public:
    void subscribe(std::function<void(const std::string&)> cb) {
        listeners_.push_back(std::move(cb));
    }
    void publish(const std::string& event) {
        for (auto& cb : listeners_) cb(event);
    }
};

// ── std::bind — avoid; use lambda instead ─────────────────
void my_func(int x, int y) { /* ... */ }

// Bad: obscure, hard to read
// auto bad = std::bind(my_func, std::placeholders::_1, 42);

// Good: clear intent
auto good = [](int x) { my_func(x, 42); };

// ── Explicit capture over blanket [=] ─────────────────────
void process(std::vector<int>& big_data) {
    int threshold = 5;

    // Bad: silently copies big_data (may be huge!)
    // auto bad_fn = [=](int x) { return x > threshold; };

    // Good: explicit — captures only what we need
    auto good_fn = [threshold](int x) { return x > threshold; };

    std::count_if(big_data.begin(), big_data.end(), good_fn);
}`
        }
      ]
    }
  ]
};
