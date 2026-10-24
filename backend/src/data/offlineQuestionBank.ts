// Curated offline question bank, served when AI generation is unavailable.
// Each entry lists the correct answer separately from the distractors; the
// service shuffles them before sending, so the correct option's position varies.

export interface BankEntry {
  q: string;
  answer: string;
  wrong: [string, string, string];
  why: string;
}

export const OFFLINE_QUESTION_BANK: Record<string, BankEntry[]> = {
  'Operating Systems': [
    {
      q: 'What is the primary function of an Operating System Kernel?',
      answer: 'Managing hardware resources and system operations',
      wrong: ['Compiling high-level source code', 'Providing web browsing capabilities', 'Designing user interfaces'],
      why: 'The kernel is the core component of an OS that manages system resources like CPU, memory, and I/O devices.',
    },
    {
      q: 'Which scheduling algorithm can cause the convoy effect?',
      answer: 'First-Come, First-Served (FCFS)',
      wrong: ['Round Robin', 'Shortest Job First (SJF)', 'Priority Scheduling'],
      why: 'In FCFS, if a long CPU-bound process arrives first, all shorter I/O-bound processes wait behind it, causing the convoy effect.',
    },
    {
      q: 'What occurs during a context switch in an OS?',
      answer: 'The state of the running process is saved and another process state is restored',
      wrong: ['The system reboots automatically', 'Memory is cleared completely', 'The kernel updates the system date and time'],
      why: 'A context switch saves the register state (PCB) of the running process and restores another, enabling multitasking.',
    },
    {
      q: 'Which condition is NOT necessary for a deadlock to occur?',
      answer: 'Preemption allowed',
      wrong: ['Mutual Exclusion', 'Hold and Wait', 'Circular Wait'],
      why: 'The Coffman conditions require No Preemption for a deadlock. Allowing preemption breaks one of the conditions and prevents deadlock.',
    },
    {
      q: 'What is thrashing in virtual memory management?',
      answer: 'Spending more time swapping pages than executing processes',
      wrong: ['Physical disk corruption', 'Overclocking the CPU frequency', 'Freeing unreferenced memory blocks'],
      why: 'Thrashing happens when processes lack enough frames, causing continuous page faults and constant page swapping.',
    },
    {
      q: 'What is a semaphore used for in operating systems?',
      answer: 'Synchronizing processes and controlling access to shared resources',
      wrong: ['Compiling C code', 'Formatting hard drives', 'Accelerating graphics rendering'],
      why: 'Semaphores are integer variables with atomic wait/signal operations used to solve critical-section problems.',
    },
    {
      q: "Which page replacement policy suffers from Belady's Anomaly?",
      answer: 'First-In, First-Out (FIFO)',
      wrong: ['Least Recently Used (LRU)', 'Optimal Page Replacement', 'Clock with reference counting'],
      why: "Belady's anomaly is when adding page frames increases page faults. FIFO exhibits it; stack algorithms like LRU and Optimal do not.",
    },
    {
      q: 'What is the main advantage of paging over segmentation?',
      answer: 'It eliminates external fragmentation',
      wrong: ['It eliminates internal fragmentation', 'It removes the need for a page table', 'It requires zero memory overhead'],
      why: 'Paging uses fixed-size frames, so any free frame can hold any page and external fragmentation cannot occur.',
    },
    {
      q: 'What is a race condition in concurrent programming?',
      answer: 'The result depends on the unpredictable timing of concurrent threads',
      wrong: ['A process running out of memory', 'High network latency between services', 'A CPU overheating event'],
      why: 'A race condition occurs when threads access and modify shared data concurrently without proper synchronization.',
    },
    {
      q: 'What is the function of the Translation Lookaside Buffer (TLB)?',
      answer: 'A hardware cache that speeds up virtual-to-physical address translation',
      wrong: ['A backup hard disk partition', 'A buffer for outgoing network packets', 'A table of open file descriptors'],
      why: 'The TLB caches recent page-table entries so most address translations avoid a page-table walk in memory.',
    },
  ],

  'Computer Networks': [
    {
      q: 'Which OSI layer is responsible for routing packets between different networks?',
      answer: 'Network layer (Layer 3)',
      wrong: ['Data Link layer (Layer 2)', 'Transport layer (Layer 4)', 'Session layer (Layer 5)'],
      why: 'Routers operate at the Network layer, forwarding packets between networks based on IP addresses.',
    },
    {
      q: 'Which transport protocol provides reliable, ordered delivery and uses a three-way handshake?',
      answer: 'TCP',
      wrong: ['UDP', 'ICMP', 'ARP'],
      why: 'TCP establishes connections with SYN, SYN-ACK, ACK and uses sequence numbers and acknowledgements for reliable ordered delivery.',
    },
    {
      q: 'What does DNS primarily do?',
      answer: 'Translates domain names into IP addresses',
      wrong: ['Assigns IP addresses to hosts dynamically', 'Encrypts traffic between browser and server', 'Maps IP addresses to MAC addresses'],
      why: 'DNS resolves human-readable names like example.com to IP addresses. Dynamic assignment is DHCP and IP-to-MAC mapping is ARP.',
    },
    {
      q: 'Which protocol resolves an IPv4 address to a MAC address on a local network?',
      answer: 'ARP',
      wrong: ['DNS', 'DHCP', 'ICMP'],
      why: 'ARP broadcasts a request asking which host owns an IP address, and that host replies with its MAC address.',
    },
    {
      q: 'HTTP/3 runs on top of which transport?',
      answer: 'QUIC over UDP',
      wrong: ['TCP with TLS 1.2', 'SCTP', 'Raw IP packets'],
      why: 'HTTP/3 uses QUIC, which runs over UDP and integrates TLS 1.3, avoiding TCP head-of-line blocking.',
    },
    {
      q: 'How many usable host addresses are in an IPv4 /24 subnet?',
      answer: '254',
      wrong: ['256', '255', '252'],
      why: 'A /24 has 256 addresses; the network address and broadcast address are reserved, leaving 254 usable hosts.',
    },
    {
      q: 'Which HTTP status code indicates a resource has moved permanently?',
      answer: '301',
      wrong: ['302', '304', '404'],
      why: '301 Moved Permanently tells clients and caches to use the new URL. 302 is a temporary redirect and 304 means Not Modified.',
    },
    {
      q: "What is the purpose of TCP's sliding window?",
      answer: 'Flow control: limiting how much unacknowledged data the sender can have in flight',
      wrong: ['Encrypting segments in transit', 'Assigning port numbers to applications', 'Choosing the route a packet takes'],
      why: 'The receiver advertises a window size so the sender does not overwhelm its buffer; the window slides as data is acknowledged.',
    },
    {
      q: 'Which device forwards frames using MAC addresses at the Data Link layer?',
      answer: 'Switch',
      wrong: ['Router', 'Hub', 'Repeater'],
      why: 'Switches learn MAC addresses per port and forward frames only where needed. Hubs and repeaters work at the Physical layer.',
    },
    {
      q: 'What does NAT do?',
      answer: 'Translates private IP addresses to a public IP address at the network boundary',
      wrong: ['Resolves hostnames to IP addresses', 'Encrypts packets end to end', 'Assigns MAC addresses to network cards'],
      why: 'NAT rewrites source and destination addresses so many private hosts can share one public IP address.',
    },
  ],

  DBMS: [
    {
      q: 'Which normal form removes partial dependencies on a composite primary key?',
      answer: 'Second Normal Form (2NF)',
      wrong: ['First Normal Form (1NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
      why: '2NF requires every non-key attribute to depend on the whole composite key, not just part of it.',
    },
    {
      q: 'What does the "I" in ACID stand for?',
      answer: 'Isolation',
      wrong: ['Integrity', 'Indexing', 'Idempotency'],
      why: 'Isolation means concurrent transactions do not see each other\'s intermediate states.',
    },
    {
      q: 'Which SQL clause filters groups after aggregation?',
      answer: 'HAVING',
      wrong: ['WHERE', 'ORDER BY', 'GROUP BY'],
      why: 'WHERE filters rows before grouping; HAVING filters the grouped results, so it can reference aggregates like COUNT(*).',
    },
    {
      q: 'What is the main benefit of a B+ tree index?',
      answer: 'Efficient O(log n) lookups and fast range scans through linked leaf nodes',
      wrong: ['It guarantees every column value is unique', 'It removes the need for joins', 'It compresses the table on disk'],
      why: 'B+ trees stay balanced for logarithmic search, and their linked leaves make range queries sequential reads.',
    },
    {
      q: 'Which join returns all rows from the left table plus matching rows from the right table?',
      answer: 'LEFT OUTER JOIN',
      wrong: ['INNER JOIN', 'CROSS JOIN', 'RIGHT OUTER JOIN'],
      why: 'A LEFT JOIN keeps every left-table row and fills right-table columns with NULL when there is no match.',
    },
    {
      q: 'What is a dirty read?',
      answer: 'Reading data written by another transaction that has not yet committed',
      wrong: [
        'Reading the same row twice and getting different committed values',
        'New rows appearing when a range query is repeated',
        'Two transactions waiting on each other\'s locks',
      ],
      why: 'A dirty read sees uncommitted changes that may later be rolled back. The other options describe non-repeatable reads, phantoms, and deadlock.',
    },
    {
      q: 'Which SQL isolation level prevents dirty reads, non-repeatable reads and phantom reads?',
      answer: 'Serializable',
      wrong: ['Read Committed', 'Repeatable Read', 'Read Uncommitted'],
      why: 'Serializable is the strictest standard level; transactions behave as if executed one after another.',
    },
    {
      q: 'What is a foreign key?',
      answer: 'A column that references a key in another table to enforce referential integrity',
      wrong: ['A column that uniquely identifies rows in its own table', 'An index that speeds up full table scans', 'A column that stores encrypted values'],
      why: 'A foreign key ensures values match an existing primary or unique key in the referenced table.',
    },
    {
      q: 'What does write-ahead logging (WAL) guarantee?',
      answer: 'Changes are recorded in a durable log before data pages are modified, enabling crash recovery',
      wrong: ['Query results are cached in memory', 'Indexes are rebuilt after every write', 'Data is replicated to another server'],
      why: 'With WAL, committed changes can be replayed from the log after a crash, providing atomicity and durability.',
    },
    {
      q: 'Which command removes all rows but keeps the table structure, without a WHERE clause?',
      answer: 'TRUNCATE',
      wrong: ['DROP', 'DELETE', 'ALTER'],
      why: 'TRUNCATE quickly empties a table while keeping its definition. DROP removes the table; DELETE can filter rows with WHERE.',
    },
  ],

  Python: [
    {
      q: 'Which keyword makes a function a generator that produces values lazily?',
      answer: 'yield',
      wrong: ['return', 'lambda', 'async'],
      why: 'A function containing yield returns a generator; each next() resumes execution until the next yield.',
    },
    {
      q: 'What does [1, 2, 3][::-1] evaluate to?',
      answer: '[3, 2, 1]',
      wrong: ['[1, 2, 3]', '[3]', 'It raises an IndexError'],
      why: 'A slice step of -1 walks the list backwards, producing a reversed copy.',
    },
    {
      q: "What does CPython's Global Interpreter Lock (GIL) restrict?",
      answer: 'Only one thread executes Python bytecode at a time in a process',
      wrong: ['The number of processes a program can start', 'The memory available to each object', 'The number of modules that can be imported'],
      why: 'The GIL serializes bytecode execution, so CPU-bound threads do not run in parallel; multiprocessing avoids this.',
    },
    {
      q: 'Which of these built-in types is immutable?',
      answer: 'tuple',
      wrong: ['list', 'dict', 'set'],
      why: 'Tuples cannot be changed after creation, which is why they can be dictionary keys when their items are hashable.',
    },
    {
      q: 'What is the problem with def f(x, items=[])?',
      answer: 'The default list is created once and shared across calls',
      wrong: ['It raises a SyntaxError', 'The list is deep-copied on every call', 'items is always None inside the function'],
      why: 'Default values are evaluated once at definition time, so mutations persist between calls. Use items=None and create the list inside.',
    },
    {
      q: 'What does the @staticmethod decorator do?',
      answer: 'Defines a method that receives neither the instance nor the class automatically',
      wrong: ['Makes an attribute read-only', 'Caches the return value of the method', 'Makes the method private'],
      why: 'A static method is a plain function namespaced in the class; @classmethod receives cls and regular methods receive self.',
    },
    {
      q: 'What is the difference between "is" and "==" in Python?',
      answer: '"is" checks object identity while "==" checks value equality',
      wrong: ['"is" checks value equality while "==" checks identity', 'They are interchangeable', '"is" only works on strings'],
      why: 'a is b is true only when both names refer to the same object; == calls __eq__ to compare values.',
    },
    {
      q: 'Inside an async function, which keyword waits for a coroutine to finish?',
      answer: 'await',
      wrong: ['yield', 'async', 'defer'],
      why: 'await suspends the current coroutine until the awaited one completes, letting the event loop run other tasks.',
    },
    {
      q: 'What is a metaclass in Python?',
      answer: 'A class whose instances are classes',
      wrong: ['The base class of all exceptions', 'A decorator applied to methods', 'A module that contains several classes'],
      why: 'Classes are themselves objects created by a metaclass (type by default), which can customise class creation.',
    },
    {
      q: 'What is the average time complexity of a key lookup in a dict?',
      answer: 'O(1)',
      wrong: ['O(log n)', 'O(n)', 'O(n log n)'],
      why: 'dicts are hash tables, so lookups are constant time on average.',
    },
  ],

  Java: [
    {
      q: 'Where are objects created with "new" allocated in the JVM?',
      answer: 'On the heap',
      wrong: ['On the thread stack', 'In CPU registers', 'In the constant pool only'],
      why: 'Objects live on the garbage-collected heap; the stack holds local primitives and references to heap objects.',
    },
    {
      q: 'What does declaring a class final mean?',
      answer: 'It cannot be subclassed',
      wrong: ['It cannot be instantiated', 'All of its methods become static', 'All of its fields become public'],
      why: 'A final class cannot be extended, for example String, which protects its behaviour and immutability.',
    },
    {
      q: 'For Strings, how do == and .equals() differ?',
      answer: '== compares references while .equals() compares character content',
      wrong: ['== compares content while .equals() compares references', 'They always give the same result', '.equals() only compares hash codes'],
      why: 'Two distinct String objects with the same text are equals() but not == unless they are the same instance.',
    },
    {
      q: 'Which collection does not allow duplicate elements?',
      answer: 'HashSet',
      wrong: ['ArrayList', 'LinkedList', 'ArrayDeque'],
      why: 'HashSet implements Set, using equals() and hashCode() to reject duplicates.',
    },
    {
      q: 'What does the volatile keyword guarantee?',
      answer: "Writes to the variable are visible to other threads' subsequent reads",
      wrong: ['Compound operations like i++ become atomic', 'Only one thread can access the variable at a time', 'The variable is never garbage collected'],
      why: 'volatile provides visibility and ordering, but not atomicity; use AtomicInteger or synchronization for i++.',
    },
    {
      q: 'What is the contract between equals() and hashCode()?',
      answer: 'Objects that are equal must have the same hash code',
      wrong: ['Objects with the same hash code must be equal', 'Every object must have a unique hash code', 'The two methods are unrelated'],
      why: 'Hash-based collections rely on equal objects landing in the same bucket. Collisions between unequal objects are allowed.',
    },
    {
      q: 'Which of these is a checked exception?',
      answer: 'IOException',
      wrong: ['NullPointerException', 'ArrayIndexOutOfBoundsException', 'IllegalArgumentException'],
      why: 'Checked exceptions must be declared or caught. The others extend RuntimeException and are unchecked.',
    },
    {
      q: 'What does the JIT compiler do?',
      answer: 'Compiles frequently executed bytecode into native machine code at runtime',
      wrong: ['Converts .java source files into .class files', 'Performs garbage collection', 'Only verifies bytecode before loading'],
      why: 'The Just-In-Time compiler optimises hot code paths while the program runs. javac produces bytecode ahead of time.',
    },
    {
      q: 'A garbage collection of only the young generation is called what?',
      answer: 'Minor GC',
      wrong: ['Full GC', 'Finalization', 'Class unloading'],
      why: 'Most objects die young, so frequent cheap minor collections clean the young generation; full GCs cover the whole heap.',
    },
    {
      q: 'What do default methods in interfaces (Java 8+) allow?',
      answer: 'Adding method implementations to an interface without breaking existing implementers',
      wrong: ['Declaring instance fields in an interface', 'Instantiating an interface directly', 'Defining constructors in an interface'],
      why: 'Default methods let libraries evolve interfaces, for example adding forEach to Iterable, without changing every implementation.',
    },
  ],

  'C++': [
    {
      q: "In RAII, what is a resource's lifetime tied to?",
      answer: 'The lifetime of an object: acquired in the constructor and released in the destructor',
      wrong: ['The lifetime of the whole program', 'Manual calls to free() only', 'The scope of global variables'],
      why: 'RAII ensures resources like memory, files and locks are released automatically when the owning object goes out of scope.',
    },
    {
      q: 'Which smart pointer expresses exclusive ownership of an object?',
      answer: 'std::unique_ptr',
      wrong: ['std::shared_ptr', 'std::weak_ptr', 'A raw pointer'],
      why: 'unique_ptr cannot be copied, only moved, so exactly one owner deletes the object.',
    },
    {
      q: 'Why should a polymorphic base class have a virtual destructor?',
      answer: "So deleting a derived object through a base pointer runs the derived destructor",
      wrong: ['To make the class abstract', 'To make destruction faster', 'To prevent the class from being copied'],
      why: 'Without a virtual destructor, delete through a base pointer is undefined behaviour and derived resources can leak.',
    },
    {
      q: 'What does std::move actually do?',
      answer: 'Casts its argument to an rvalue reference so move operations can be selected',
      wrong: ['Physically relocates the object in memory', 'Performs a deep copy', 'Destroys the source object immediately'],
      why: 'std::move is just a cast; the actual transfer happens in the move constructor or move assignment operator.',
    },
    {
      q: 'What is the average lookup complexity of std::unordered_map?',
      answer: 'O(1)',
      wrong: ['O(log n)', 'O(n)', 'O(n log n)'],
      why: 'unordered_map is a hash table, giving constant average lookups (degrading to O(n) with heavy collisions).',
    },
    {
      q: 'How is std::map typically implemented?',
      answer: 'As a self-balancing binary search tree (usually a red-black tree)',
      wrong: ['As a hash table', 'As a sorted contiguous array', 'As a singly linked list'],
      why: 'std::map keeps keys ordered with O(log n) insert, erase and lookup, which a balanced BST provides.',
    },
    {
      q: 'How does a reference differ from a pointer?',
      answer: 'A reference must be initialised and cannot be reseated to another object',
      wrong: ['References can be null while pointers cannot', 'Pointers cannot be reassigned after initialisation', 'There is no difference'],
      why: 'A reference is an alias bound once at initialisation; pointers can be null and can point to different objects over time.',
    },
    {
      q: 'What happens when push_back exceeds a std::vector\'s capacity?',
      answer: 'It allocates a larger buffer and moves or copies the elements, invalidating iterators',
      wrong: ['It throws an exception', 'It writes past the end of the buffer', 'It converts the vector into a linked list'],
      why: 'Vectors grow geometrically; after reallocation, existing pointers, references and iterators to elements are invalid.',
    },
    {
      q: 'What does marking a member function const mean?',
      answer: "It promises not to modify the object's non-mutable state",
      wrong: ['It is evaluated at compile time', 'It must return a const value', 'It cannot be called on non-const objects'],
      why: 'Inside a const member function, this points to const, so it can be called on const objects.',
    },
    {
      q: 'What is the Rule of Three?',
      answer: 'If a class needs a custom destructor, copy constructor or copy assignment, it probably needs all three',
      wrong: ['A class should have at most three constructors', 'Inheritance should be at most three levels deep', 'Every class needs three access specifiers'],
      why: 'Manually managed resources need consistent copy and cleanup behaviour; C++11 extends this to the Rule of Five with move operations.',
    },
  ],

  Frontend: [
    {
      q: 'What is reconciliation in React?',
      answer: 'Diffing the new element tree against the previous one to compute minimal DOM updates',
      wrong: ['Rendering components on the server', 'Bundling JavaScript modules for production', 'Persisting state to local storage'],
      why: 'React compares trees and applies only the changes to the real DOM, which keeps updates efficient.',
    },
    {
      q: 'Why should list items have a stable key prop?',
      answer: 'It lets React identify which items changed, moved, were added or removed',
      wrong: ['It is required for CSS styling', 'It improves screen reader output', 'Event handlers do not work without it'],
      why: 'Stable keys let React match elements between renders; using indexes can cause state to attach to the wrong item.',
    },
    {
      q: 'Changing which CSS property typically avoids layout and paint, triggering only compositing?',
      answer: 'transform',
      wrong: ['width', 'top', 'margin'],
      why: 'transform and opacity can be handled by the compositor on the GPU, while geometry changes force layout.',
    },
    {
      q: 'What is event delegation?',
      answer: 'Handling events from many children with a single listener on a common ancestor',
      wrong: ['Attaching a separate listener to every element', 'Running event handlers inside a web worker', 'Calling preventDefault on every event'],
      why: 'Events bubble up, so one ancestor listener can inspect event.target, which saves memory and covers dynamically added elements.',
    },
    {
      q: 'When does useEffect(fn, []) run?',
      answer: 'Once after the initial render, with its cleanup running on unmount',
      wrong: ['After every render', 'Never', 'Before the component first renders'],
      why: 'An empty dependency array means the effect has no dependencies that change, so it runs only after mount.',
    },
    {
      q: 'Which selector has higher specificity: #nav or .a.b.c?',
      answer: '#nav, because one ID outranks any number of classes',
      wrong: ['.a.b.c, because it has three classes', 'They are equal, so the last rule wins', 'Neither applies to the same element'],
      why: 'Specificity is compared by column (IDs, classes, elements); a single ID beats any number of class selectors.',
    },
    {
      q: 'What causes layout thrashing?',
      answer: 'Alternating DOM reads like offsetHeight with writes, forcing repeated synchronous reflows',
      wrong: ['Loading too many CSS files', 'Using large background images', 'Using flexbox for layout'],
      why: 'Each read after a write forces the browser to recalculate layout immediately; batch reads before writes instead.',
    },
    {
      q: 'What does debouncing an input handler do?',
      answer: 'Delays the call until events stop firing for a set time',
      wrong: ['Runs the handler at most once every fixed interval', 'Cancels every event permanently', 'Runs handlers in parallel threads'],
      why: 'Debouncing waits for a pause, for example after typing stops; running at a fixed interval is throttling.',
    },
    {
      q: 'What is CORS?',
      answer: 'A browser mechanism where servers use HTTP headers to allow cross-origin requests',
      wrong: ['A CSS layout framework', 'A cookie encryption scheme', 'A client-side routing library'],
      why: 'Browsers block cross-origin responses unless the server allows them with headers such as Access-Control-Allow-Origin.',
    },
    {
      q: 'Which script attribute downloads in parallel and executes, in order, after the document is parsed?',
      answer: 'defer',
      wrong: ['async', 'nomodule', 'crossorigin'],
      why: 'defer scripts run in document order after parsing. async scripts run as soon as they load, in any order.',
    },
  ],

  Backend: [
    {
      q: 'Which HTTP method is idempotent and typically replaces a resource entirely?',
      answer: 'PUT',
      wrong: ['POST', 'PATCH', 'CONNECT'],
      why: 'Repeating the same PUT leaves the resource in the same state. POST is not idempotent and PATCH is not guaranteed to be.',
    },
    {
      q: 'In the cache-aside pattern, what happens on a cache miss?',
      answer: 'The application reads from the database and then stores the result in the cache',
      wrong: ['The cache fetches from the database by itself', 'The request fails with an error', 'The cache returns the last stale value'],
      why: 'With cache-aside, application code manages the cache; a cache that loads data itself is called read-through.',
    },
    {
      q: 'What does HTTP status 429 mean?',
      answer: 'Too Many Requests (rate limited)',
      wrong: ['Not Found', 'Unauthorized', 'Internal Server Error'],
      why: '429 tells the client it exceeded a rate limit, often with a Retry-After header.',
    },
    {
      q: 'Which problem of fixed REST endpoints does GraphQL mainly address?',
      answer: 'Over-fetching and under-fetching, by letting clients request exactly the fields they need',
      wrong: ['The need for a database', 'The need for authentication', 'Slow network hardware'],
      why: 'A single GraphQL query can return precisely the shape of data a client asks for, often replacing several REST calls.',
    },
    {
      q: 'What does database connection pooling do?',
      answer: 'Reuses a set of open connections instead of opening a new one per request',
      wrong: ['Replicates the database to another server', 'Encrypts queries in transit', 'Splits tables across shards'],
      why: 'Opening connections is expensive, so pools keep connections ready and cap how many are open at once.',
    },
    {
      q: 'What is horizontal scaling?',
      answer: 'Adding more machines or instances to share the load',
      wrong: ['Adding more CPU and RAM to a single machine', 'Caching responses at the edge', 'Compressing response payloads'],
      why: 'Horizontal scaling adds nodes behind a load balancer; upgrading a single machine is vertical scaling.',
    },
    {
      q: "What does a JWT's signature guarantee?",
      answer: 'The token was not tampered with and was issued by someone holding the signing key',
      wrong: ['The payload is encrypted and hidden', 'The token never expires', 'The user is currently online'],
      why: 'A standard signed JWT is only base64-encoded, so anyone can read the payload; the signature protects its integrity.',
    },
    {
      q: 'What is a key benefit of putting a message queue between microservices?',
      answer: 'It decouples producers from consumers and buffers load for asynchronous processing',
      wrong: ['It guarantees zero latency', 'It replaces the need for a database', 'It makes failures impossible'],
      why: 'Queues let services work at their own pace and survive temporary consumer outages without losing messages.',
    },
    {
      q: 'What is the N+1 query problem?',
      answer: 'Fetching a list with one query, then running one extra query per item',
      wrong: ['Running N servers behind 1 load balancer', 'Retrying a failed query N+1 times', 'Creating N+1 indexes on a table'],
      why: 'It usually comes from lazy-loading in ORMs; fix it with joins, eager loading or batched queries.',
    },
    {
      q: 'What does the circuit breaker pattern do?',
      answer: 'Stops calling a failing dependency for a while so failures do not cascade, then probes for recovery',
      wrong: ['Encrypts traffic between services', 'Balances load across replicas', 'Retries failed calls forever'],
      why: 'After repeated failures the breaker "opens" and fails fast, later allowing a trial request in a half-open state.',
    },
  ],

  'Machine Learning': [
    {
      q: 'In gradient descent, which direction are parameters updated?',
      answer: 'Opposite to the gradient of the loss',
      wrong: ['In the direction of the gradient', 'In a random direction', 'Perpendicular to the gradient'],
      why: 'The gradient points towards steepest increase, so stepping against it reduces the loss.',
    },
    {
      q: 'High training accuracy but low validation accuracy usually indicates what?',
      answer: 'Overfitting',
      wrong: ['Underfitting', 'High bias', 'Optimal generalisation'],
      why: 'The model has memorised training data, including noise, and fails to generalise to unseen examples.',
    },
    {
      q: 'How is precision calculated?',
      answer: 'TP / (TP + FP)',
      wrong: ['TP / (TP + FN)', '(TP + TN) / total', 'TN / (TN + FP)'],
      why: 'Precision is the fraction of predicted positives that are truly positive. TP / (TP + FN) is recall.',
    },
    {
      q: 'What is the purpose of L2 regularization?',
      answer: 'Penalising large weights to reduce overfitting',
      wrong: ['Increasing the learning rate', 'Adding more layers to the network', 'Setting irrelevant weights exactly to zero'],
      why: 'L2 adds the sum of squared weights to the loss, shrinking weights smoothly. L1 tends to produce exact zeros.',
    },
    {
      q: 'Which activation function helps mitigate vanishing gradients in deep networks?',
      answer: 'ReLU',
      wrong: ['Sigmoid', 'Tanh', 'Step function'],
      why: "ReLU's gradient is 1 for positive inputs, so it does not saturate the way sigmoid and tanh do.",
    },
    {
      q: 'In k-fold cross-validation, what does k represent?',
      answer: 'The number of folds the data is split into, each used once for validation',
      wrong: ['The number of nearest neighbours', 'The number of clusters', 'The number of training epochs'],
      why: 'The model is trained k times, each time validating on a different fold, and the scores are averaged.',
    },
    {
      q: 'Which unsupervised algorithm partitions data into k clusters by minimising within-cluster variance?',
      answer: 'k-means',
      wrong: ['k-nearest neighbours', 'Logistic regression', 'Random forest'],
      why: 'k-means alternates between assigning points to the nearest centroid and recomputing centroids.',
    },
    {
      q: 'A very simple model typically has which bias-variance profile?',
      answer: 'High bias and low variance',
      wrong: ['Low bias and high variance', 'Low bias and low variance', 'High bias and high variance'],
      why: 'Simple models make strong assumptions (bias) but change little between training sets (low variance), so they tend to underfit.',
    },
    {
      q: 'What can happen if the learning rate is too high?',
      answer: 'The loss oscillates or diverges instead of converging',
      wrong: ['Convergence is always faster', 'The model can only overfit', 'Training is unaffected'],
      why: 'Steps that are too large overshoot the minimum and can bounce around or blow up the loss.',
    },
    {
      q: 'Why do we hold out a test set?',
      answer: 'To estimate performance on data the model has not seen',
      wrong: ['To double the amount of training data', 'To make training run faster', 'Because gradient descent requires it'],
      why: 'Evaluating on training data overestimates performance; a held-out set approximates real-world accuracy.',
    },
  ],

  DSA: [
    {
      q: 'What is the time complexity of binary search on a sorted array?',
      answer: 'O(log n)',
      wrong: ['O(n)', 'O(1)', 'O(n log n)'],
      why: 'Each comparison halves the remaining search range.',
    },
    {
      q: 'Which data structure does breadth-first search use?',
      answer: 'Queue',
      wrong: ['Stack', 'Heap', 'Hash set'],
      why: 'BFS visits nodes level by level, processing them in first-in, first-out order. DFS uses a stack.',
    },
    {
      q: 'What is the worst-case time complexity of quicksort?',
      answer: 'O(n²)',
      wrong: ['O(n log n)', 'O(n)', 'O(log n)'],
      why: 'Consistently bad pivots, such as the smallest element on sorted input, create n levels of recursion.',
    },
    {
      q: 'Which algorithm finds shortest paths from one source in a graph with non-negative edge weights?',
      answer: "Dijkstra's algorithm",
      wrong: ["Kruskal's algorithm", "Prim's algorithm", 'Topological sort'],
      why: "Dijkstra's greedily settles the closest unvisited vertex using a priority queue. Kruskal's and Prim's build minimum spanning trees.",
    },
    {
      q: 'Dynamic programming applies when a problem has which properties?',
      answer: 'Overlapping subproblems and optimal substructure',
      wrong: ['Only sorted input', 'No recursive structure', 'Only independent subproblems'],
      why: 'DP stores results of repeated subproblems; independent subproblems are the domain of plain divide and conquer.',
    },
    {
      q: 'What is the time complexity of inserting into a binary heap?',
      answer: 'O(log n)',
      wrong: ['O(1)', 'O(n)', 'O(n log n)'],
      why: 'The new element is appended and sifted up at most the height of the tree, which is log n.',
    },
    {
      q: 'What does an inorder traversal of a binary search tree produce?',
      answer: 'The keys in ascending sorted order',
      wrong: ['The keys in descending order', 'The keys level by level', 'The keys in insertion order'],
      why: 'Inorder visits left subtree, node, then right subtree, which follows the BST ordering property.',
    },
    {
      q: 'What is the worst-case lookup time in a hash table using chaining when every key collides?',
      answer: 'O(n)',
      wrong: ['O(1)', 'O(log n)', 'O(n²)'],
      why: 'If all keys land in one bucket, lookup scans a single list of n items.',
    },
    {
      q: 'Which sorting algorithm is stable and O(n log n) in the worst case?',
      answer: 'Merge sort',
      wrong: ['Quicksort', 'Heapsort', 'Selection sort'],
      why: 'Merge sort always splits evenly and preserves the order of equal keys. Heapsort is O(n log n) but not stable.',
    },
    {
      q: 'How can you detect a cycle in a linked list using O(1) extra space?',
      answer: "Floyd's tortoise and hare: two pointers moving at different speeds",
      wrong: ['Store visited nodes in a hash set', 'Sort the list first', 'Use binary search on the nodes'],
      why: 'If there is a cycle, the fast pointer eventually meets the slow one. A hash set works but uses O(n) space.',
    },
  ],
};
