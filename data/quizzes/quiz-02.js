var q2 = {
  chapterId: 2,
  passingScore: 70,
  questions: [
    {
      id: 'q2-1',
      text: 'What hidden member does the compiler add to every object of a class with at least one virtual function?',
      options: [
        { id: 'a', text: 'A reference count for automatic memory management.' },
        { id: 'b', text: 'A vptr (virtual pointer) pointing to the class\'s vtable.', correct: true },
        { id: 'c', text: 'A copy of all virtual function implementations.' },
        { id: 'd', text: 'A type ID for dynamic_cast support only.' }
      ],
      explanation: 'Every polymorphic object contains a vptr — a hidden pointer to its class\'s vtable. The vtable is an array of function pointers. A virtual call loads vptr, indexes into the vtable, and calls the function pointer there.'
    },
    {
      id: 'q2-2',
      text: 'Why must a polymorphic base class always declare its destructor virtual?',
      options: [
        { id: 'a', text: 'Because virtual destructors run faster than regular destructors.' },
        { id: 'b', text: 'To prevent the class from being inherited.' },
        { id: 'c', text: 'Deleting a derived object through a base pointer without a virtual destructor only calls the base destructor — undefined behaviour.', correct: true },
        { id: 'd', text: 'Virtual destructors are required to use make_unique.' }
      ],
      explanation: 'Without a virtual destructor, deleting through a base pointer calls only the base destructor, skipping derived cleanup. This leaks any resources the derived class owns. With virtual ~Base(), the correct derived destructor is called via vtable lookup.'
    },
    {
      id: 'q2-3',
      text: 'What does the override keyword do?',
      options: [
        { id: 'a', text: 'It forces the function to use dynamic dispatch even on value types.' },
        { id: 'b', text: 'It tells the compiler to verify that the function actually overrides a virtual base function.', correct: true },
        { id: 'c', text: 'It makes the function non-virtual.' },
        { id: 'd', text: 'It prevents further subclassing.' }
      ],
      explanation: 'override is a compile-time check: if the function signature doesn\'t match any virtual function in a base class, the compiler reports an error. This catches typos (e.g., draw() vs Draw()) that would silently create a new non-virtual function instead of overriding.'
    },
    {
      id: 'q2-4',
      text: 'A class with at least one pure virtual function is called:',
      options: [
        { id: 'a', text: 'A template class.' },
        { id: 'b', text: 'An abstract class — it cannot be instantiated directly.', correct: true },
        { id: 'c', text: 'A final class.' },
        { id: 'd', text: 'A sealed class.' }
      ],
      explanation: 'A pure virtual function (= 0) makes the class abstract. You cannot create objects of an abstract class directly — only concrete subclasses that implement all pure virtuals can be instantiated.'
    },
    {
      id: 'q2-5',
      text: 'What is CRTP and what is its main advantage over virtual dispatch?',
      options: [
        { id: 'a', text: 'CRTP = Compile-time Runtime Template Pattern; it allows runtime polymorphism with no overhead.' },
        { id: 'b', text: 'CRTP = Curiously Recurring Template Pattern; it provides compile-time polymorphism with zero vtable overhead and enables inlining.', correct: true },
        { id: 'c', text: 'CRTP is a memory layout optimization for polymorphic classes.' },
        { id: 'd', text: 'CRTP replaces the need for inheritance entirely.' }
      ],
      explanation: 'CRTP (Curiously Recurring Template Pattern) achieves static polymorphism: Derived inherits from Base<Derived>. Calls are resolved at compile time, so there\'s no vtable, no indirect call, and the compiler can inline everything. The downside: you lose runtime flexibility — all types must be known at compile time.'
    },
    {
      id: 'q2-6',
      text: 'How many extra pointer-sized indirections does a virtual function call add compared to a direct call?',
      options: [
        { id: 'a', text: 'Zero — virtual dispatch is optimized away.' },
        { id: 'b', text: 'One — just one vtable lookup.' },
        { id: 'c', text: 'Two — load vptr from object, then load function pointer from vtable.', correct: true },
        { id: 'd', text: 'Four — the vtable is doubly-indirected.' }
      ],
      explanation: 'A virtual call compiles to: (1) load vptr from the object, (2) load the function pointer from vtable[slot], (3) call through the pointer. That\'s two loads plus an indirect branch, compared to a direct call\'s single branch.'
    },
    {
      id: 'q2-7',
      text: 'What does marking a class or virtual function with final do?',
      options: [
        { id: 'a', text: 'It makes the class singleton.' },
        { id: 'b', text: 'It prevents further derivation or overriding, and may allow the compiler to devirtualize calls.', correct: true },
        { id: 'c', text: 'It converts virtual functions to inline functions.' },
        { id: 'd', text: 'It removes the vtable from the class.' }
      ],
      explanation: 'final on a class prevents inheritance; final on a virtual function prevents further overriding. Additionally, knowing a type is final lets the compiler devirtualize calls on that type — turning virtual calls into direct calls that can be inlined.'
    },
    {
      id: 'q2-8',
      text: 'Which approach is best when you have a type-safe heterogeneous collection with a closed (known) set of types?',
      options: [
        { id: 'a', text: 'virtual dispatch with a common base class.' },
        { id: 'b', text: 'std::any with dynamic_cast.' },
        { id: 'c', text: 'std::variant + std::visit for static dispatch (C++17).', correct: true },
        { id: 'd', text: 'void* with manual casting.' }
      ],
      explanation: 'std::variant<A,B,C> + std::visit provides type-safe static dispatch over a closed set of types. No heap allocation, no vtable, and the compiler can often inline all visitor branches. Use virtual dispatch when the type set is open (extensible at link time).'
    }
  ]
};
