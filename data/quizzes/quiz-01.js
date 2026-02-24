var q1 = {
  chapterId: 1,
  passingScore: 70,
  questions: [
    {
      id: 'q1-1',
      text: 'What happens to all iterators into a std::vector when push_back() causes a reallocation?',
      options: [
        { id: 'a', text: 'They are updated automatically to point to the new buffer.' },
        { id: 'b', text: 'They become invalid (dangling).' , correct: true },
        { id: 'c', text: 'They point to the old buffer, which remains valid until the next operation.' },
        { id: 'd', text: 'Only end() is invalidated; other iterators remain valid.' }
      ],
      explanation: 'When a vector reallocates, it moves all elements to a new heap buffer and frees the old one. Any iterator, pointer, or reference into the old buffer becomes dangling — using them is undefined behaviour.'
    },
    {
      id: 'q1-2',
      text: 'Which vector operation has amortized O(1) time complexity?',
      options: [
        { id: 'a', text: 'insert() at the beginning' },
        { id: 'b', text: 'erase() in the middle' },
        { id: 'c', text: 'push_back()' , correct: true },
        { id: 'd', text: 'find() on unsorted vector' }
      ],
      explanation: 'push_back() is amortized O(1) because most calls just write to pre-allocated capacity. Occasional reallocations are O(n) but by doubling capacity each time, the amortized cost per element is constant.'
    },
    {
      id: 'q1-3',
      text: 'What is the key advantage of std::array over a raw C-style array T arr[N]?',
      options: [
        { id: 'a', text: 'std::array stores elements on the heap.' },
        { id: 'b', text: 'std::array can change size at runtime.' },
        { id: 'c', text: 'std::array supports value semantics (copyable/assignable) and knows its own size.', correct: true },
        { id: 'd', text: 'std::array has O(1) insertion anywhere.' }
      ],
      explanation: 'std::array is a thin wrapper adding value semantics — you can copy, assign, compare, and pass it by value. It also knows its size via .size(). Raw C arrays lack these properties. Both store data on the stack with no heap allocation.'
    },
    {
      id: 'q1-4',
      text: 'What is Small String Optimization (SSO) in std::string?',
      options: [
        { id: 'a', text: 'Short strings are stored using a compressed encoding.' },
        { id: 'b', text: 'Short strings (≤~15 chars) are stored directly inside the string object, avoiding heap allocation.', correct: true },
        { id: 'c', text: 'std::string_view is used automatically for strings under 16 chars.' },
        { id: 'd', text: 'Short strings share a global string pool to save memory.' }
      ],
      explanation: 'SSO stores short strings (typically ≤15 characters on 64-bit systems) in a fixed buffer inside the string object itself — no heap allocation. Longer strings use heap memory. This makes short strings essentially free to create.'
    },
    {
      id: 'q1-5',
      text: 'When should you prefer std::map over std::unordered_map?',
      options: [
        { id: 'a', text: 'When you need O(1) average lookup.' },
        { id: 'b', text: 'When keys are integers.' },
        { id: 'c', text: 'When you need sorted iteration or range queries (lower_bound / upper_bound).', correct: true },
        { id: 'd', text: 'When the number of elements is very large.' }
      ],
      explanation: 'std::map stores elements in a sorted red-black tree, giving O(log n) operations with sorted iteration and efficient range queries. std::unordered_map offers O(1) average lookup but no ordering guarantees.'
    },
    {
      id: 'q1-6',
      text: 'What does v.at(i) do that v[i] does not?',
      options: [
        { id: 'a', text: 'at() is always faster than operator[].' },
        { id: 'b', text: 'at() performs bounds checking and throws std::out_of_range if i >= size.', correct: true },
        { id: 'c', text: 'at() returns a copy, not a reference.' },
        { id: 'd', text: 'at() works on const vectors while operator[] does not.' }
      ],
      explanation: 'v.at(i) bounds-checks: if i >= v.size() it throws std::out_of_range. v[i] has no bounds check — accessing out-of-range with operator[] is undefined behaviour.'
    },
    {
      id: 'q1-7',
      text: 'What is the worst-case time complexity of std::unordered_map::find()?',
      options: [
        { id: 'a', text: 'O(1)' },
        { id: 'b', text: 'O(log n)' },
        { id: 'c', text: 'O(n)', correct: true },
        { id: 'd', text: 'O(n log n)' }
      ],
      explanation: 'unordered_map uses hash table with separate chaining. In the worst case (all keys hash to the same bucket), every lookup must scan the entire collision chain — O(n). Average case is O(1).'
    },
    {
      id: 'q1-8',
      text: 'What does v.reserve(n) do?',
      options: [
        { id: 'a', text: 'Sets the size to n, default-initializing new elements.' },
        { id: 'b', text: 'Pre-allocates capacity for n elements without changing size.', correct: true },
        { id: 'c', text: 'Shrinks the vector to hold exactly n elements.' },
        { id: 'd', text: 'Copies the vector n times.' }
      ],
      explanation: 'reserve(n) ensures capacity >= n without changing size or initializing elements. It prevents reallocation (and iterator invalidation) for subsequent push_back calls as long as size stays below n.'
    }
  ]
};
