/**
 * search-index.js — Pre-built flat array for Fuse.js
 * One entry per section. Body text is stripped of HTML tags.
 */

var searchIndex = [
  // ── Chapter 1: STL Containers ──────────────────────────────
  {
    id: 'idx-1-1',
    chapterId: 1,
    sectionId: 'vec-overview',
    chapterTitle: 'STL Containers',
    sectionTitle: 'std::vector — Dynamic Array',
    body: 'vector heap-allocated contiguous array grows automatically size capacity push_back emplace_back insert erase reserve shrink_to_fit reallocation invalidates iterators amortized O(1)',
    tags: ['vector', 'push_back', 'reserve', 'capacity', 'reallocation', 'iterator invalidation'],
    hash: '#chapter/1/vec-overview'
  },
  {
    id: 'idx-1-2',
    chapterId: 1,
    sectionId: 'array-overview',
    chapterTitle: 'STL Containers',
    sectionTitle: 'std::array — Fixed-Size Stack Array',
    body: 'array fixed size compile-time constant stack allocated no heap no pointer indirection value semantics copyable assignable STL algorithms structured bindings',
    tags: ['array', 'fixed-size', 'stack', 'compile-time', 'value semantics'],
    hash: '#chapter/1/array-overview'
  },
  {
    id: 'idx-1-3',
    chapterId: 1,
    sectionId: 'string-overview',
    chapterTitle: 'STL Containers',
    sectionTitle: 'std::string — Dynamic String',
    body: 'string dynamic character buffer null-terminated small string optimization SSO string_view non-owning view find substr append concatenation stoi to_string',
    tags: ['string', 'string_view', 'SSO', 'small string optimization', 'find', 'substr'],
    hash: '#chapter/1/string-overview'
  },
  {
    id: 'idx-1-4',
    chapterId: 1,
    sectionId: 'unordered-map-overview',
    chapterTitle: 'STL Containers',
    sectionTitle: 'std::unordered_map — Hash Map',
    body: 'unordered_map hash table separate chaining bucket load factor rehash average O(1) lookup insert erase find contains emplace structured binding reserve max_load_factor',
    tags: ['unordered_map', 'hash map', 'hash table', 'O(1)', 'find', 'emplace', 'load factor'],
    hash: '#chapter/1/unordered-map-overview'
  },
  {
    id: 'idx-1-5',
    chapterId: 1,
    sectionId: 'map-overview',
    chapterTitle: 'STL Containers',
    sectionTitle: 'std::map — Ordered Map (Red-Black Tree)',
    body: 'map ordered red-black tree O(log n) sorted iteration range queries lower_bound upper_bound comparator bidirectional iterators key-value pairs',
    tags: ['map', 'ordered', 'red-black tree', 'lower_bound', 'upper_bound', 'sorted', 'O(log n)'],
    hash: '#chapter/1/map-overview'
  },
  {
    id: 'idx-1-6',
    chapterId: 1,
    sectionId: 'container-choice',
    chapterTitle: 'STL Containers',
    sectionTitle: 'Choosing the Right Container',
    body: 'container choice decision guide vector default sequence array fixed size unordered_map fast lookup map sorted deque unique set when to use which container',
    tags: ['container choice', 'decision', 'vector vs map', 'when to use'],
    hash: '#chapter/1/container-choice'
  },

  // ── Chapter 2: Virtual Functions ──────────────────────────
  {
    id: 'idx-2-1',
    chapterId: 2,
    sectionId: 'vtable-mechanism',
    chapterTitle: 'Virtual Functions & Polymorphism',
    sectionTitle: 'The vtable Mechanism',
    body: 'vtable virtual dispatch table vptr virtual pointer function pointer array indirect call two indirections object size overhead no inlining',
    tags: ['vtable', 'vptr', 'virtual dispatch', 'dynamic dispatch', 'polymorphism', 'indirect call'],
    hash: '#chapter/2/vtable-mechanism'
  },
  {
    id: 'idx-2-2',
    chapterId: 2,
    sectionId: 'virtual-usage',
    chapterTitle: 'Virtual Functions & Polymorphism',
    sectionTitle: 'Declaring & Overriding Virtual Functions',
    body: 'virtual override final pure virtual abstract class destructor virtual dtor delete base pointer derived resource leak',
    tags: ['virtual', 'override', 'final', 'pure virtual', 'abstract', 'virtual destructor'],
    hash: '#chapter/2/virtual-usage'
  },
  {
    id: 'idx-2-3',
    chapterId: 2,
    sectionId: 'pure-virtual-interface',
    chapterTitle: 'Virtual Functions & Polymorphism',
    sectionTitle: 'Pure Virtual & Interface Pattern',
    body: 'pure virtual interface pattern no data members all pure abstract contract ISerializer concrete implementations dependency injection',
    tags: ['interface', 'pure virtual', 'abstract class', 'dependency injection'],
    hash: '#chapter/2/pure-virtual-interface'
  },
  {
    id: 'idx-2-4',
    chapterId: 2,
    sectionId: 'virtual-costs',
    chapterTitle: 'Virtual Functions & Polymorphism',
    sectionTitle: 'Costs & Alternatives',
    body: 'virtual dispatch cost 1-5ns no inlining CRTP curiously recurring template pattern compile-time polymorphism std::variant std::visit static dispatch devirtualization',
    tags: ['virtual cost', 'CRTP', 'variant', 'visit', 'devirtualize', 'performance'],
    hash: '#chapter/2/virtual-costs'
  },

  // ── Chapter 3: Templates ───────────────────────────────────
  {
    id: 'idx-3-1',
    chapterId: 3,
    sectionId: 'function-templates',
    chapterTitle: 'Templates',
    sectionTitle: 'Function Templates',
    body: 'function template type deduction instantiation explicit specialization concepts C++20 constrained SFINAE generic programming blueprint',
    tags: ['function template', 'type deduction', 'instantiation', 'explicit specialization', 'concepts'],
    hash: '#chapter/3/function-templates'
  },
  {
    id: 'idx-3-2',
    chapterId: 3,
    sectionId: 'class-templates',
    chapterTitle: 'Templates',
    sectionTitle: 'Class Templates',
    body: 'class template generic container stack ring buffer non-type template parameter compile-time value partial specialization on-demand instantiation',
    tags: ['class template', 'generic', 'non-type parameter', 'partial specialization'],
    hash: '#chapter/3/class-templates'
  },
  {
    id: 'idx-3-3',
    chapterId: 3,
    sectionId: 'variadic-templates',
    chapterTitle: 'Templates',
    sectionTitle: 'Variadic Templates',
    body: 'variadic template parameter pack pack expansion fold expression sizeof... tuple make_unique recursive variadic C++17',
    tags: ['variadic', 'parameter pack', 'fold expression', 'sizeof...', 'tuple'],
    hash: '#chapter/3/variadic-templates'
  },
  {
    id: 'idx-3-4',
    chapterId: 3,
    sectionId: 'template-tradeoffs',
    chapterTitle: 'Templates',
    sectionTitle: 'Template Trade-offs',
    body: 'template code bloat compile time error messages explicit instantiation concepts type erasure std::any std::function header-only',
    tags: ['code bloat', 'compile time', 'template errors', 'explicit instantiation', 'type erasure'],
    hash: '#chapter/3/template-tradeoffs'
  },

  // ── Chapter 4: lvalue / rvalue ─────────────────────────────
  {
    id: 'idx-4-1',
    chapterId: 4,
    sectionId: 'value-categories',
    chapterTitle: 'Value Categories & Move Semantics',
    sectionTitle: 'Value Categories: lvalue, rvalue, xvalue',
    body: 'lvalue rvalue xvalue prvalue value category identity addressable temporary expression glvalue std::move cast T&&',
    tags: ['lvalue', 'rvalue', 'xvalue', 'prvalue', 'glvalue', 'value category'],
    hash: '#chapter/4/value-categories'
  },
  {
    id: 'idx-4-2',
    chapterId: 4,
    sectionId: 'move-semantics',
    chapterTitle: 'Value Categories & Move Semantics',
    sectionTitle: 'Move Constructors & Move Assignment',
    body: 'move constructor move assignment steal resources pointer swap O(1) rule of five noexcept valid empty state',
    tags: ['move constructor', 'move assignment', 'rule of five', 'noexcept', 'steal resources'],
    hash: '#chapter/4/move-semantics'
  },
  {
    id: 'idx-4-3',
    chapterId: 4,
    sectionId: 'std-move-forward',
    chapterTitle: 'Value Categories & Move Semantics',
    sectionTitle: 'std::move and std::forward',
    body: 'std::move unconditional cast rvalue std::forward perfect forwarding conditional preserves value category universal reference forwarding reference NRVO return value optimization',
    tags: ['std::move', 'std::forward', 'perfect forwarding', 'NRVO', 'forwarding reference'],
    hash: '#chapter/4/std-move-forward'
  },
  {
    id: 'idx-4-4',
    chapterId: 4,
    sectionId: 'move-practical',
    chapterTitle: 'Value Categories & Move Semantics',
    sectionTitle: 'Practical Guidelines',
    body: 'rule of zero sink parameter return by value move into container noexcept moved-from state reuse practical guidelines',
    tags: ['rule of zero', 'sink parameter', 'move guidelines', 'best practices'],
    hash: '#chapter/4/move-practical'
  },

  // ── Chapter 5: Atomics & Mutex ─────────────────────────────
  {
    id: 'idx-5-1',
    chapterId: 5,
    sectionId: 'data-races',
    chapterTitle: 'Atomics & Mutexes',
    sectionTitle: 'Data Races & Undefined Behaviour',
    body: 'data race undefined behaviour concurrent access write no synchronization corruption crash silent bugs race condition',
    tags: ['data race', 'undefined behaviour', 'race condition', 'concurrent', 'thread safety'],
    hash: '#chapter/5/data-races'
  },
  {
    id: 'idx-5-2',
    chapterId: 5,
    sectionId: 'atomic',
    chapterTitle: 'Atomics & Mutexes',
    sectionTitle: 'std::atomic — Lock-Free Operations',
    body: 'atomic lock-free fetch_add compare_exchange CAS memory order relaxed acquire release seq_cst counter flag thread-safe single instruction',
    tags: ['atomic', 'lock-free', 'CAS', 'compare_exchange', 'memory_order', 'fetch_add'],
    hash: '#chapter/5/atomic'
  },
  {
    id: 'idx-5-3',
    chapterId: 5,
    sectionId: 'mutex-lock-guard',
    chapterTitle: 'Atomics & Mutexes',
    sectionTitle: 'std::mutex & RAII Lock Guards',
    body: 'mutex lock_guard unique_lock scoped_lock RAII condition_variable wait notify_one critical section automatic unlock exception safe producer consumer',
    tags: ['mutex', 'lock_guard', 'unique_lock', 'scoped_lock', 'condition_variable', 'RAII'],
    hash: '#chapter/5/mutex-lock-guard'
  },
  {
    id: 'idx-5-4',
    chapterId: 5,
    sectionId: 'deadlock',
    chapterTitle: 'Atomics & Mutexes',
    sectionTitle: 'Deadlock & How to Prevent It',
    body: 'deadlock prevention lock ordering scoped_lock multiple mutexes recursive mutex shared_mutex read-write lock try_lock backoff',
    tags: ['deadlock', 'lock ordering', 'scoped_lock', 'shared_mutex', 'prevention'],
    hash: '#chapter/5/deadlock'
  },
  {
    id: 'idx-5-5',
    chapterId: 5,
    sectionId: 'concurrency-guidelines',
    chapterTitle: 'Atomics & Mutexes',
    sectionTitle: 'Concurrency Guidelines',
    body: 'concurrency guidelines atomic counter flag mutex protect data condition variable producer consumer shared_mutex read-heavy once_flag call_once lazy initialization message passing',
    tags: ['concurrency', 'guidelines', 'call_once', 'once_flag', 'message passing', 'thread safe'],
    hash: '#chapter/5/concurrency-guidelines'
  }
];
