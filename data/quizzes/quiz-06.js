var q6 = {
  chapterId: 4,
  passingScore: 70,
  questions: [
    {
      id: 'q6-1',
      text: 'What does [=] in a lambda capture clause do?',
      options: [
        { id: 'a', text: 'Captures all local variables by reference.' },
        { id: 'b', text: 'Captures all local variables used in the lambda body by value (copy) at the time the lambda is created.', correct: true },
        { id: 'c', text: 'Captures only the variables explicitly listed by value.' },
        { id: 'd', text: 'Captures nothing — [=] is the same as [].' }
      ],
      explanation: '[=] tells the compiler to copy every local variable the lambda actually uses, at the point the lambda is constructed. Later changes to the originals have no effect on the lambda\'s copies. Prefer explicit captures like [x, y] over blanket [=] to avoid unintentional copies of large objects.'
    },
    {
      id: 'q6-2',
      text: 'What is the main risk of capturing a local variable by reference with [&] and storing the lambda beyond the local\'s lifetime?',
      options: [
        { id: 'a', text: 'The lambda will copy the variable instead of referencing it.' },
        { id: 'b', text: 'The lambda cannot be stored in std::function.' },
        { id: 'c', text: 'The reference becomes dangling when the local is destroyed, causing undefined behaviour.', correct: true },
        { id: 'd', text: 'The compiler will refuse to compile the code.' }
      ],
      explanation: 'A by-reference capture stores the address of the local variable. If the lambda outlives that variable (e.g. it is returned from the function or stored in a member), accessing the reference is undefined behaviour — the memory has been reclaimed. Capture by value or use [*this] when the lambda may outlive its captured variables.'
    },
    {
      id: 'q6-3',
      text: 'What does the mutable keyword do when applied to a lambda?',
      options: [
        { id: 'a', text: 'It allows the lambda to modify variables captured by reference.' },
        { id: 'b', text: 'It allows the lambda to modify its own copies of variables captured by value.', correct: true },
        { id: 'c', text: 'It makes the lambda\'s return type mutable.' },
        { id: 'd', text: 'It makes the lambda thread-safe.' }
      ],
      explanation: 'By default, a by-value capture is const inside the lambda body. The mutable keyword removes that const, letting you modify the lambda\'s internal copy. The original variable in the enclosing scope is never affected — mutable only grants write access to the lambda\'s own copies.'
    },
    {
      id: 'q6-4',
      text: 'Which of the following can std::function<void(int)> hold?',
      options: [
        { id: 'a', text: 'Only lambda expressions.' },
        { id: 'b', text: 'Only free functions.' },
        { id: 'c', text: 'Lambdas, free functions, functors, and bound member functions — any callable matching void(int).', correct: true },
        { id: 'd', text: 'Only objects with a virtual operator().' }
      ],
      explanation: 'std::function uses type erasure to hold any callable whose signature matches the template argument. This includes lambdas, plain function pointers, functors (objects with operator()), and results of std::bind. The concrete type is erased — only the call signature is preserved.'
    },
    {
      id: 'q6-5',
      text: 'Why is std::function not zero-cost compared to storing a lambda with auto?',
      options: [
        { id: 'a', text: 'std::function always makes a deep copy of the callable on every call.' },
        { id: 'b', text: 'std::function may heap-allocate the callable and uses an indirect (virtual-like) call, preventing inlining.', correct: true },
        { id: 'c', text: 'std::function adds a lock around every call for thread safety.' },
        { id: 'd', text: 'std::function compiles to larger binary code because it is a class template.' }
      ],
      explanation: 'std::function performs type erasure via an internal virtual-dispatch-like mechanism. Large callables that exceed the small-buffer are heap-allocated. Every invocation goes through an indirect call that the optimizer cannot inline. By contrast, auto captures the lambda\'s exact (unique) type, allowing the compiler to see through and inline the call.'
    },
    {
      id: 'q6-6',
      text: 'What is special about a generic lambda: [](auto x) { return x * 2; }?',
      options: [
        { id: 'a', text: 'It accepts any type but always returns int.' },
        { id: 'b', text: 'It is equivalent to a function template — the compiler generates a separate operator() for each argument type used.', correct: true },
        { id: 'c', text: 'It uses RTTI at runtime to determine the type of x.' },
        { id: 'd', text: 'It captures all local variables by value automatically.' }
      ],
      explanation: 'A generic lambda with auto parameters (C++14) is syntactic sugar for a local function template. The compiler instantiates a new operator() for each distinct argument type — just like a regular template. auto x, auto y lets a single lambda work with int, double, string, etc., without writing a named function template.'
    },
    {
      id: 'q6-7',
      text: 'Given: int x = 5; auto f = [x]() { return x; }; x = 10; What does f() return?',
      options: [
        { id: 'a', text: '10 — f captures x by reference and sees the updated value.' },
        { id: 'b', text: '5 — f captured a copy of x at the time the lambda was created.', correct: true },
        { id: 'c', text: 'Undefined behaviour — x was modified after the lambda was created.' },
        { id: 'd', text: '0 — the capture is zero-initialized.' }
      ],
      explanation: '[x] captures x by value at the moment the lambda is constructed — when x is 5. The lambda\'s internal copy is independent of the original variable. Assigning x = 10 afterward has no effect on the copy. f() returns 5.'
    },
    {
      id: 'q6-8',
      text: 'When should you prefer auto over std::function for storing a lambda?',
      options: [
        { id: 'a', text: 'Always — std::function is never useful.' },
        { id: 'b', text: 'Only when the lambda captures no variables.' },
        { id: 'c', text: 'Internally, when you know the exact lambda type at declaration — auto avoids heap allocation and enables inlining.', correct: true },
        { id: 'd', text: 'Only in constexpr contexts.' }
      ],
      explanation: 'auto preserves the lambda\'s exact (unique, compiler-generated) type. The compiler can see through it, inline the call, and store the lambda without heap allocation. Use std::function only at API boundaries where the callable type must be erased — for instance, when storing heterogeneous callables in a container or accepting a callback from external callers.'
    }
  ]
};
