var q3 = {
  chapterId: 3,
  passingScore: 70,
  questions: [
    {
      id: 'q3-1',
      text: 'When does the compiler instantiate a function template?',
      options: [
        { id: 'a', text: 'When the template is defined.' },
        { id: 'b', text: 'When the translation unit that contains the definition is compiled.' },
        { id: 'c', text: 'When the template is called with specific types.', correct: true },
        { id: 'd', text: 'At link time, once all translation units are combined.' }
      ],
      explanation: 'Template instantiation happens at the call site — when the compiler sees a call with specific types, it generates a concrete version of the function for those types. This is why template definitions must be visible (in headers) at the point of use.'
    },
    {
      id: 'q3-2',
      text: 'What is "code bloat" in the context of templates?',
      options: [
        { id: 'a', text: 'Templates produce verbose error messages that increase source file size.' },
        { id: 'b', text: 'Each distinct set of template arguments produces a separate compiled function in the binary.', correct: true },
        { id: 'c', text: 'Template classes use more memory at runtime than equivalent non-template classes.' },
        { id: 'd', text: 'Templates prevent the linker from removing unused code.' }
      ],
      explanation: 'Every unique instantiation (e.g., sort<int*>, sort<double*>, sort<string*>) generates a distinct function in the binary. With many types, this can significantly increase binary size. Explicit instantiation in .cpp files and judicious use of type erasure can mitigate this.'
    },
    {
      id: 'q3-3',
      text: 'In template<typename T, std::size_t N> class RingBuffer, what kind of parameter is N?',
      options: [
        { id: 'a', text: 'A type parameter.' },
        { id: 'b', text: 'A non-type (value) template parameter.', correct: true },
        { id: 'c', text: 'A variadic pack parameter.' },
        { id: 'd', text: 'A template-template parameter.' }
      ],
      explanation: 'N is a non-type template parameter — a compile-time constant value embedded in the type. This lets the class use std::array<T, N> internally, placing the buffer on the stack with zero heap allocation. RingBuffer<int,8> and RingBuffer<int,16> are distinct types.'
    },
    {
      id: 'q3-4',
      text: 'What does the C++17 fold expression (args + ...) compute for sum(1, 2, 3, 4)?',
      options: [
        { id: 'a', text: 'It concatenates the args as strings.' },
        { id: 'b', text: 'It applies + left-to-right: ((1+2)+3)+4 = 10.', correct: true },
        { id: 'c', text: 'It applies + right-to-left: 1+(2+(3+4)) = 10.' },
        { id: 'd', text: 'It fails to compile — fold expressions require at least 2 arguments.' }
      ],
      explanation: '(args + ...) is a unary right fold, expanding to 1+(2+(3+4)) = 10 — same result for addition since + is associative. For subtraction order matters: (args - ...) would be 1-(2-(3-4)) = -2, not -8. The left fold (...+args) gives ((1+2)+3)+4.'
    },
    {
      id: 'q3-5',
      text: 'Why must template definitions (not just declarations) typically be in header files?',
      options: [
        { id: 'a', text: 'The linker cannot find template symbols across translation units.' },
        { id: 'b', text: 'Instantiation happens at the call site; the compiler needs the full definition visible to generate the specific version.', correct: true },
        { id: 'c', text: 'Templates use a different calling convention that requires inline definitions.' },
        { id: 'd', text: 'Template definitions in .cpp files produce ambiguous symbols at link time.' }
      ],
      explanation: 'When the compiler instantiates template<typename T> void sort(T* begin, T* end) for T=int, it needs to see the complete function body to generate int-specific code. If only the declaration is visible, it can\'t instantiate. Explicit instantiation in .cpp files is an alternative.'
    },
    {
      id: 'q3-6',
      text: 'What does a C++20 Concept primarily provide?',
      options: [
        { id: 'a', text: 'Runtime type checking for template arguments.' },
        { id: 'b', text: 'Compile-time constraints on template parameters with readable error messages.', correct: true },
        { id: 'c', text: 'Automatic template specialization based on type traits.' },
        { id: 'd', text: 'A way to instantiate templates at compile time only.' }
      ],
      explanation: 'Concepts constrain what types a template accepts, enforced at compile time. When a type doesn\'t satisfy a concept, the error names the concept and the violated requirement — far clearer than pre-C++20 "substitution failure" walls of text.'
    },
    {
      id: 'q3-7',
      text: 'What is a template full specialization?',
      options: [
        { id: 'a', text: 'A template that works for all types.' },
        { id: 'b', text: 'A custom implementation of a template for one specific set of template arguments.', correct: true },
        { id: 'c', text: 'A template with constrained type parameters.' },
        { id: 'd', text: 'A template that partially constrains some but not all parameters.' }
      ],
      explanation: 'Full specialization provides a completely different implementation for an exact set of template arguments. For example, template<> std::string to_str<bool>(bool) provides a custom version just for bool, while the primary template handles all other types.'
    },
    {
      id: 'q3-8',
      text: 'In template<typename T, typename... Rest> void print(T first, Rest... rest), what is Rest called?',
      options: [
        { id: 'a', text: 'A type constraint.' },
        { id: 'b', text: 'A parameter pack.', correct: true },
        { id: 'c', text: 'A fold expression.' },
        { id: 'd', text: 'A non-type template parameter.' }
      ],
      explanation: 'Rest... is a parameter pack — it can represent zero or more types. The ... after a pack name expands it. sizeof...(Rest) gives the count. C++17 fold expressions provide a cleaner way to operate on packs without explicit recursion.'
    }
  ]
};
