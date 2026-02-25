var q4 = {
  chapterId: 6,
  passingScore: 70,
  questions: [
    {
      id: 'q4-1',
      text: 'Which of the following is an lvalue?',
      options: [
        { id: 'a', text: '42' },
        { id: 'b', text: 'a + b (where a, b are ints)' },
        { id: 'c', text: 'A named variable x declared as int x = 5;', correct: true },
        { id: 'd', text: 'std::string{"temporary"}' }
      ],
      explanation: 'A named variable is an lvalue — it has a persistent identity and a stable address. Literals (42), arithmetic temporaries (a+b), and unnamed temporaries (string{"..."}) are prvalues — they exist only for the duration of the expression.'
    },
    {
      id: 'q4-2',
      text: 'What does std::move(x) actually do at runtime?',
      options: [
        { id: 'a', text: 'It copies x into a new temporary.' },
        { id: 'b', text: 'It immediately transfers x\'s resources to a new location.' },
        { id: 'c', text: 'It does nothing at runtime — it\'s just a cast to T&&.', correct: true },
        { id: 'd', text: 'It calls x\'s destructor.' }
      ],
      explanation: 'std::move is purely a cast: static_cast<T&&>(x). It changes the value category of x to an xvalue (rvalue reference), signaling "I no longer need this". The actual resource transfer happens only if a move constructor or move assignment operator is subsequently called.'
    },
    {
      id: 'q4-3',
      text: 'Why should move constructors be marked noexcept?',
      options: [
        { id: 'a', text: 'noexcept allows the move to be inlined.' },
        { id: 'b', text: 'std::vector uses move instead of copy during reallocation only when the move constructor is noexcept.', correct: true },
        { id: 'c', text: 'Move constructors that throw would corrupt memory.' },
        { id: 'd', text: 'noexcept is required by the C++ standard for all move constructors.' }
      ],
      explanation: 'std::vector::resize needs to move or copy elements to a new buffer. To maintain the strong exception guarantee, it copies if the move constructor might throw. Only when noexcept is declared will vector use the move constructor — giving O(1) per element instead of O(n) copy.'
    },
    {
      id: 'q4-4',
      text: 'What is the difference between std::move and std::forward?',
      options: [
        { id: 'a', text: 'std::move is for basic types, std::forward is for class types.' },
        { id: 'b', text: 'std::move unconditionally casts to rvalue; std::forward conditionally preserves the original value category.', correct: true },
        { id: 'c', text: 'std::forward always produces an rvalue, std::move preserves the category.' },
        { id: 'd', text: 'They are identical — std::forward is just an alias for std::move.' }
      ],
      explanation: 'std::move always casts to T&&. std::forward<T>(x) is conditional: if T is T& (lvalue reference), it casts to T& (keeps lvalue); if T is T or T&& (non-reference), it casts to T&& (makes rvalue). This preserves what the original caller passed — used for perfect forwarding in template functions.'
    },
    {
      id: 'q4-5',
      text: 'What is a "forwarding reference" (also called universal reference)?',
      options: [
        { id: 'a', text: 'A const T& that can bind to both lvalues and rvalues.' },
        { id: 'b', text: 'T&& in a template context where T is deduced — can bind to both lvalues (T deduces to T&) and rvalues (T deduces to T).', correct: true },
        { id: 'c', text: 'An rvalue reference to an rvalue reference.' },
        { id: 'd', text: 'Any T&& parameter in any function.' }
      ],
      explanation: 'A forwarding reference is specifically T&& in a function template where T is a deduced type parameter. If called with an lvalue, T deduces to T& (making the parameter T& &, which collapses to T&). If called with an rvalue, T deduces to T. std::forward then uses T to restore the original category.'
    },
    {
      id: 'q4-6',
      text: 'Why should you NOT write "return std::move(local_var);" in most functions?',
      options: [
        { id: 'a', text: 'std::move on a local variable is always UB.' },
        { id: 'b', text: 'It prevents Named Return Value Optimization (NRVO), which would elide the copy/move entirely.', correct: true },
        { id: 'c', text: 'The return type must be T&& for std::move to work in a return statement.' },
        { id: 'd', text: 'It makes the returned value an lvalue, causing an extra copy.' }
      ],
      explanation: 'NRVO lets the compiler construct the return value directly in the caller\'s storage — zero copies, zero moves. Wrapping the return in std::move disables NRVO (because the expression is now an xvalue, not a plain name). Just write "return local_var;" and let the compiler optimize.'
    },
    {
      id: 'q4-7',
      text: 'What is the "Rule of Zero"?',
      options: [
        { id: 'a', text: 'Classes should have zero virtual functions.' },
        { id: 'b', text: 'If your class owns resources, you must define exactly zero special member functions.' },
        { id: 'c', text: 'If your class only holds RAII wrappers, declare none of the five special member functions — the compiler generates correct ones automatically.', correct: true },
        { id: 'd', text: 'Classes must have zero raw pointers.' }
      ],
      explanation: 'Rule of Zero: if all your class\'s members handle their own resource management (string, vector, unique_ptr), you don\'t need to write any special member functions — the compiler-generated copy, move, and destructor are all correct. This is the preferred modern C++ style.'
    },
    {
      id: 'q4-8',
      text: 'After std::vector<string> v; string s = "hello"; v.push_back(std::move(s)); what is the state of s?',
      options: [
        { id: 'a', text: 's is destroyed and should not be used.' },
        { id: 'b', text: 's is in a valid but unspecified state (likely empty "").', correct: true },
        { id: 'c', text: 's retains its original value "hello".' },
        { id: 'd', text: 'The program has undefined behaviour.' }
      ],
      explanation: 'After a move, the moved-from object is in a valid but unspecified state. For std::string, this is typically an empty string. You can re-assign s safely, but you shouldn\'t read from it without first checking or re-assigning. The program has well-defined behaviour — only the value is unspecified.'
    },
    {
      id: 'q4-9',
      text: 'What is an xvalue?',
      options: [
        { id: 'a', text: 'A cross-platform value that works on all compilers.' },
        { id: 'b', text: 'A value that has both identity and can be moved from — typically the result of std::move() or a T&& function return.', correct: true },
        { id: 'c', text: 'An exclusive value that can only be held by one variable at a time.' },
        { id: 'd', text: 'An extended value that persists beyond its expression.' }
      ],
      explanation: 'xvalue (expiring value) sits between lvalue and prvalue: like an lvalue it has identity (it is a named thing), but like a prvalue it is safe to move from — its resources are about to expire. std::move(x) produces an xvalue from lvalue x.'
    }
  ]
};
