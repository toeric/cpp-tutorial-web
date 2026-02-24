var ch2 = {
  id: 2,
  slug: 'virtual-functions',
  title: 'Virtual Functions & Polymorphism',
  description: 'How virtual dispatch works, the vtable mechanism, override/final, pure virtual interfaces, and the costs of dynamic polymorphism.',
  estimatedMinutes: 11,
  tags: ['virtual', 'vtable', 'polymorphism', 'override', 'inheritance', 'dynamic dispatch', 'pure virtual'],

  sections: [
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
