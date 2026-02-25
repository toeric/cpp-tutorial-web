var ch2 = {
  id: 2,
  slug: 'virtual-functions',
  title: 'Virtual Functions & Polymorphism',
  description: 'How virtual dispatch works, the vtable mechanism, override/final, pure virtual interfaces, costs of dynamic polymorphism, and alternatives like std::variant + std::visit.',
  level: 'basic',
  estimatedMinutes: 16,
  tags: ['virtual', 'vtable', 'polymorphism', 'override', 'inheritance', 'dynamic dispatch', 'pure virtual', 'variant', 'visit', 'CRTP'],

  sections: [
    {
      id: 'why-virtual',
      title: 'Why Virtual Functions?',
      content: `<p>The core problem virtual functions solve: when you hold a <em>base class pointer</em> to a derived object, which method gets called? Without <code>virtual</code>, C++ uses <strong>static dispatch</strong> — the type of the <em>pointer</em>, not the actual object, determines the call. This is almost never what you want.</p>
<div class="callout danger">
  <span class="callout-icon">✗</span>
  <div class="callout-content"><p>Without <code>virtual</code>, calling a method through a base pointer always calls the <strong>base class version</strong> — even if the actual object is a derived type. The method in the derived class is simply ignored.</p></div>
</div>
<p>Adding <code>virtual</code> switches to <strong>dynamic dispatch</strong>: the correct method is selected at runtime based on the actual object type, not the pointer type. This is the foundation of polymorphism.</p>
<h3>A real-world pattern: heterogeneous collections</h3>
<p>The most common motivation is managing a collection of objects that share a common interface but have different behaviours — a game's entity loop, a UI widget hierarchy, a plugin system, a notification service. You want to iterate over them uniformly and call the right implementation for each:</p>`,
      codeBlocks: [
        {
          id: 'static-dispatch-problem',
          language: 'cpp',
          caption: 'Without virtual — static dispatch always calls the base',
          code: `#include <iostream>

struct Logger {
    // NOT virtual — dispatch is determined by the pointer type at compile time
    void log(const std::string& msg) {
        std::cout << "[base] " << msg << '\\n';
    }
};

struct FileLogger : Logger {
    void log(const std::string& msg) {   // hides base, does NOT override
        std::cout << "[file] " << msg << '\\n';
    }
};

struct ConsoleLogger : Logger {
    void log(const std::string& msg) {
        std::cout << "[console] " << msg << '\\n';
    }
};

void write_log(Logger* logger, const std::string& msg) {
    logger->log(msg);  // pointer type is Logger* — always calls Logger::log
}

FileLogger   fl;
ConsoleLogger cl;

write_log(&fl, "disk full");     // ❌  prints "[base] disk full"
write_log(&cl, "server up");     // ❌  prints "[base] server up"
// FileLogger::log and ConsoleLogger::log are NEVER called`
        },
        {
          id: 'virtual-fix-realworld',
          language: 'cpp',
          caption: 'With virtual — and a real-world entity loop',
          code: `#include <iostream>
#include <vector>
#include <memory>

struct Logger {
    virtual ~Logger() = default;         // Always virtual in a polymorphic base
    virtual void log(const std::string& msg) = 0;  // Pure virtual — must override
};

struct FileLogger : Logger {
    void log(const std::string& msg) override {
        std::cout << "[file] " << msg << '\\n';  // writes to file
    }
};

struct ConsoleLogger : Logger {
    void log(const std::string& msg) override {
        std::cout << "[console] " << msg << '\\n';
    }
};

struct SlackLogger : Logger {
    void log(const std::string& msg) override {
        std::cout << "[slack] " << msg << '\\n';  // POST to webhook
    }
};

// Broadcaster knows nothing about the concrete logger types
void broadcast(const std::vector<std::unique_ptr<Logger>>& loggers,
               const std::string& msg) {
    for (const auto& logger : loggers)
        logger->log(msg);  // ✓ virtual dispatch — calls the right override
}

// ── Game entity loop — another common pattern ─────────────
class Entity {
public:
    virtual ~Entity() = default;
    virtual void update(float dt) = 0;   // AI / physics / input
    virtual void draw() const = 0;       // renderer
};

class Player : public Entity {
public:
    void update(float dt) override { /* read gamepad, apply physics */ }
    void draw()  const override   { /* draw player sprite          */ }
};

class Enemy : public Entity {
public:
    void update(float dt) override { /* pathfinding, attack logic  */ }
    void draw()  const override   { /* draw enemy sprite           */ }
};

class Particle : public Entity {
public:
    void update(float dt) override { /* physics simulation         */ }
    void draw()  const override   { /* draw spark effect           */ }
};

// Game loop — uniform interface, heterogeneous types
std::vector<std::unique_ptr<Entity>> world;
world.push_back(std::make_unique<Player>());
world.push_back(std::make_unique<Enemy>());
world.push_back(std::make_unique<Particle>());

float dt = 0.016f;
for (auto& e : world) {
    e->update(dt);  // calls Player::update, Enemy::update, Particle::update
    e->draw();      // calls the right draw() for each
}
// Correct destructors called when world is cleared — because ~Entity is virtual`
        }
      ]
    },

    {
      id: 'vtable-mechanism',
      title: 'The vtable Mechanism',
      content: `
<p>When you declare a function <code>virtual</code>, the compiler builds a <em>virtual dispatch table</em> (vtable) for each class that has at least one virtual function. The vtable is an array of function pointers — one per virtual function — stored in read-only memory.</p>
<p>Each object of such a class contains a hidden <strong>vptr</strong> (virtual pointer) — a pointer to its class's vtable. The vptr is typically the first 8 bytes of the object (on 64-bit). A virtual call like <code>base->draw()</code> compiles to:</p>
<ol>
  <li>Load <code>vptr</code> from the object.</li>
  <li>Load the function pointer at <code>vtable[slot]</code>.</li>
  <li>Call through that pointer.</li>
</ol>
<p>This is exactly <strong>two extra memory indirections</strong> compared to a direct call. Modern branch predictors handle common patterns well, but virtual calls prevent inlining.</p>
<div class="callout info">
  <span class="callout-icon">ℹ</span>
  <div class="callout-content"><p><strong>sizeof overhead:</strong> Every polymorphic object is padded by one pointer (8 bytes on 64-bit) for the vptr. Classes with no virtual functions have no vptr overhead.</p></div>
</div>`,
      codeBlocks: [],
      diagrams: [
        {
          id: 'vtable-diagram',
          type: 'svg',
          src: 'assets/diagrams/vtable.svg',
          caption: 'vtable layout — each object holds a vptr to its class vtable'
        }
      ],
    },

    {
      id: 'virtual-usage',
      title: 'Declaring & Overriding Virtual Functions',
      content: `
<p>Mark a function <code>virtual</code> in the base class. Derived classes override it — the C++11 <code>override</code> keyword tells the compiler to verify the signature matches, catching typos and mismatches at compile time.</p>
<p><code>final</code> prevents further overriding (or inheritance of the entire class). The compiler may devirtualize final calls.</p>
<div class="callout danger">
  <span class="callout-icon">✗</span>
  <div class="callout-content"><p><strong>Always declare the destructor virtual</strong> in a polymorphic base class. Deleting a derived object through a base pointer without a virtual destructor is undefined behaviour — only the base destructor runs, leaking derived resources.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'virtual-basic',
          language: 'cpp',
          caption: 'Virtual function, override, final, pure virtual interface',
          code: `class Shape {
public:
    virtual ~Shape() = default;          // Virtual dtor — REQUIRED

    virtual double area() const = 0;     // Pure virtual → Shape is abstract
    virtual void draw() const;           // Non-pure: has a default implementation
    virtual std::string name() const final { return "Shape"; } // Can't override
};

class Circle : public Shape {
public:
    explicit Circle(double r) : radius_(r) {}

    double area() const override {       // 'override' = compile-time signature check
        return 3.14159 * radius_ * radius_;
    }

    void draw() const override;

private:
    double radius_;
};

// Polymorphic usage
void printArea(const Shape& s) {
    // Virtual dispatch — calls Circle::area() if s is a Circle
    std::cout << s.area() << '\\n';
}

std::unique_ptr<Shape> s = std::make_unique<Circle>(5.0);
printArea(*s);   // → 78.5...
// s destroyed here — virtual dtor called Circle::~Circle, then Shape::~Shape`
        }
      ]
    },

    {
      id: 'pure-virtual-interface',
      title: 'Pure Virtual & Interface Pattern',
      content: `
<p>A class with <strong>all</strong> virtual functions pure (and no data members) is a C++ <em>interface</em>. It enforces a contract without imposing any implementation details.</p>
<p>Pure virtual functions (<code>= 0</code>) make the class abstract — it cannot be instantiated directly. Any concrete subclass must implement all pure virtuals or it too becomes abstract.</p>`,
      codeBlocks: [
        {
          id: 'interface-pattern',
          language: 'cpp',
          caption: 'Interface pattern with pure virtual functions',
          code: `// Interface — no data, all pure virtual
class ISerializer {
public:
    virtual ~ISerializer() = default;
    virtual std::string serialize(const Data&) const = 0;
    virtual Data       deserialize(std::string_view) const = 0;
};

// Concrete implementations
class JsonSerializer : public ISerializer {
public:
    std::string serialize(const Data& d) const override { /* JSON logic */ }
    Data       deserialize(std::string_view s) const override { /* ... */ }
};

class BinarySerializer : public ISerializer {
public:
    std::string serialize(const Data& d) const override { /* binary logic */ }
    Data       deserialize(std::string_view s) const override { /* ... */ }
};

// Client code depends only on the interface
void save(const ISerializer& ser, const Data& data) {
    std::string out = ser.serialize(data);
    // ...
}`
        }
      ]
    },

    {
      id: 'virtual-costs',
      title: 'Costs & Alternatives',
      content: `
<p>Virtual dispatch has real but often overstated costs:</p>
<ul>
  <li><strong>Indirect call:</strong> ~1-5 ns extra vs. direct call (two loads + branch).</li>
  <li><strong>No inlining:</strong> The compiler cannot inline a virtual call it can't devirtualize.</li>
  <li><strong>Cache pressure:</strong> vptr and vtable entries consume cache lines.</li>
  <li><strong>Object size:</strong> +8 bytes per object (one vptr).</li>
</ul>
<p>For performance-critical hot paths, consider alternatives:</p>
<ul>
  <li><strong>CRTP (Curiously Recurring Template Pattern):</strong> Compile-time polymorphism, zero overhead, but loses runtime flexibility.</li>
  <li><strong>std::variant + std::visit:</strong> Type-safe union with static dispatch (C++17).</li>
  <li><strong>Function pointers / std::function:</strong> Manual vtable — sometimes faster, sometimes not.</li>
  <li><strong>Devirtualization:</strong> The compiler can often devirtualize calls on <code>final</code> types or local objects it fully knows.</li>
</ul>
<div class="callout tip">
  <span class="callout-icon">✓</span>
  <div class="callout-content"><p>In most applications, virtual dispatch cost is irrelevant. Profile first. If dispatch <em>is</em> a bottleneck, CRTP or <code>std::variant</code> are the standard alternatives.</p></div>
</div>`,
      codeBlocks: [
        {
          id: 'crtp-example',
          language: 'cpp',
          caption: 'CRTP — compile-time polymorphism, zero overhead',
          code: `// CRTP base — no virtual, no vtable
template<typename Derived>
class ShapeBase {
public:
    double area() const {
        return static_cast<const Derived*>(this)->area_impl();
    }
};

class Circle : public ShapeBase<Circle> {
public:
    explicit Circle(double r) : r_(r) {}
    double area_impl() const { return 3.14159 * r_ * r_; }
private:
    double r_;
};

// Template function — statically dispatched, can be inlined
template<typename S>
void print(const ShapeBase<S>& s) {
    std::cout << s.area() << '\\n';  // No virtual call
}

Circle c(5.0);
print(c);  // Fully inlined by the compiler`
        },
        {
          id: 'variant-visit-example',
          language: 'cpp',
          caption: 'std::variant + std::visit — closed-set, value-semantics alternative',
          code: `#include <variant>
#include <vector>
#include <iostream>
#include <cmath>

// Plain data types — no inheritance, no virtual, no heap per object
struct Circle    { double radius; };
struct Rectangle { double w, h;   };
struct Triangle  { double base, height; };

// Shape is exactly one of the above three types
using Shape = std::variant<Circle, Rectangle, Triangle>;

// ── The overloaded trick — compose lambdas into one visitor ──
// (Can be put in a utility header once and reused everywhere)
template<typename... Ts>
struct overloaded : Ts... { using Ts::operator()...; };
template<typename... Ts>
overloaded(Ts...) -> overloaded<Ts...>;  // C++17 deduction guide

// ── Visitors — one lambda per concrete type ──────────────────
double area(const Shape& s) {
    return std::visit(overloaded{
        [](const Circle& c)    { return M_PI * c.radius * c.radius; },
        [](const Rectangle& r) { return r.w * r.h; },
        [](const Triangle& t)  { return 0.5 * t.base * t.height; },
    }, s);
}

std::string name(const Shape& s) {
    return std::visit(overloaded{
        [](const Circle&)    -> std::string { return "Circle"; },
        [](const Rectangle&) -> std::string { return "Rectangle"; },
        [](const Triangle&)  -> std::string { return "Triangle"; },
    }, s);
}

// ── Usage ─────────────────────────────────────────────────────
// Shapes stored by value — no heap allocation per shape
std::vector<Shape> shapes = {
    Circle{5.0},
    Rectangle{3.0, 4.0},
    Triangle{6.0, 8.0}
};

for (const auto& s : shapes) {
    std::cout << name(s) << ": area = " << area(s) << '\\n';
}
// Circle: area = 78.54
// Rectangle: area = 12
// Triangle: area = 24

// ── Comparison with virtual ───────────────────────────────────
// ✓  No heap allocation per object (shapes stored inline in the vector)
// ✓  No vtable, no vptr overhead — compiler can inline all branches
// ✓  Exhaustive: forgetting a type in std::visit is a compile error
// ✗  Closed set: adding a new shape type requires editing every visitor
// ✗  All types must be known at compile time (no runtime plugins)`
        }
      ],
      complexityTable: {
        rows: [
          { operation: 'Direct function call',     complexity: 'O(1)', notes: 'Inlinable' },
          { operation: 'Virtual call (devirtualized)', complexity: 'O(1)', notes: 'Inlinable by compiler' },
          { operation: 'Virtual call (dynamic)',    complexity: 'O(1)', notes: '2 loads + indirect branch, not inlinable' },
          { operation: 'std::function call',        complexity: 'O(1)', notes: 'Heap alloc possible, not inlinable' },
        ]
      }
    }
  ]
};
