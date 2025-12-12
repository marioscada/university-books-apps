# AI PR Review - Capacità Complete

Questo documento elenca tutte le capacità dell'AI assistant nelle operazioni di review delle Pull Request.

## 📖 Lettura e Accesso

### Informazioni PR

#### Metadata Base
- Leggere titolo della PR
- Leggere descrizione completa della PR
- Visualizzare numero identificativo della PR
- Controllare stato corrente (open, closed, merged, draft)
- Verificare se PR è work in progress
- Controllare se PR è ready for review
- Vedere data di creazione
- Vedere data ultima modifica
- Controllare se PR è locked

#### Partecipanti
- Vedere autore della PR
- Visualizzare reviewers assegnati
- Controllare reviewers richiesti
- Vedere chi ha approvato
- Vedere chi ha richiesto modifiche
- Identificare assignees
- Vedere mentioned users
- Controllare CODEOWNERS match

#### Classificazione
- Controllare label assegnate
- Verificare milestone associata
- Vedere project boards collegati
- Controllare linked issues
- Verificare referenced PRs
- Vedere related discussions

#### Branch Information
- Verificare branch di origine
- Verificare branch di destinazione
- Controllare se branch è protetto
- Vedere commit count nel branch
- Verificare se branch è aggiornato con base
- Controllare divergence con base branch
- Vedere branch policies applicate

#### Status & Checks
- Accedere a tutti i check status
- Vedere risultati CI/CD
- Controllare status test execution
- Verificare linting status
- Vedere code coverage checks
- Controllare security scan results
- Verificare build status
- Vedere deployment status
- Controllare required checks completion
- Verificare optional checks

#### Review State
- Vedere approval count
- Controllare requested changes count
- Verificare comment count
- Vedere review threads aperti
- Controllare review threads risolti
- Verificare pending reviews
- Controllare review dismissals
- Vedere stale reviews

#### Merge Status
- Controllare se PR è mergeable
- Verificare conflitti di merge presenti
- Vedere blockers al merge
- Controllare merge method permesso
- Verificare auto-merge configuration
- Controllare required approvals soddisfatti
- Verificare branch protection rules
- Vedere merge queue status

### File e Modifiche

#### File Listing
- Elencare tutti i file modificati
- Contare numero totale file modificati
- Vedere file aggiunti
- Vedere file modificati
- Vedere file eliminati
- Identificare file rinominati
- Identificare file spostati
- Vedere file con solo whitespace changes
- Identificare file binari modificati
- Vedere file con merge conflicts

#### Diff Analysis
- Vedere diff completo per ogni file
- Controllare diff unified format
- Vedere diff split view
- Controllare diff inline
- Identificare hunks di modifiche
- Vedere context lines
- Controllare changed lines count
- Identificare unchanged regions

#### Change Metrics
- Contare additions totali
- Contare deletions totali
- Calcolare net change
- Contare additions per file
- Contare deletions per file
- Calcolare churn per file
- Vedere percentage changed per file
- Identificare largest changes

#### File Content
- Leggere contenuto completo file modificato
- Accedere a versione HEAD del file
- Accedere a versione base del file
- Vedere file history completo
- Controllare blame information
- Vedere previous versions
- Accedere a file metadata

#### File Types
- Identificare file TypeScript
- Identificare file JavaScript
- Identificare file HTML templates
- Identificare file CSS/SCSS
- Identificare file JSON/YAML
- Identificare file markdown
- Identificare file di test
- Identificare file di configurazione
- Identificare file documentation
- Identificare file assets

#### Change Patterns
- Identificare modifiche in blocchi di codice
- Vedere modifiche line-by-line
- Identificare code movements
- Vedere refactoring changes
- Identificare formatting changes
- Controllare import changes
- Vedere export changes
- Identificare structural changes

### Commit History

#### Commit Information
- Leggere lista completa dei commit
- Vedere commit SHA completi
- Vedere commit SHA abbreviati
- Controllare commit count
- Vedere commit tree structure
- Identificare merge commits
- Vedere squashed commits
- Controllare commit parents

#### Commit Messages
- Leggere commit messages complete
- Verificare commit message format
- Controllare conventional commits
- Vedere commit message body
- Verificare commit footers
- Controllare breaking change notes
- Vedere co-authors
- Verificare signed-off-by

#### Commit Metadata
- Controllare autore di ogni commit
- Vedere committer information
- Controllare author date
- Vedere commit date
- Verificare author email
- Controllare author name
- Vedere timezone information

#### Commit Content
- Vedere file modificati per commit
- Controllare changes per commit
- Vedere diff per commit
- Identificare commit scope
- Controllare affected modules per commit

#### Commit Sequence
- Analizzare sequenza temporale delle modifiche
- Vedere ordine chronologico commits
- Identificare rebase history
- Controllare cherry-picks
- Vedere amended commits

#### Commit Operations
- Identificare force pushes
- Vedere force push history
- Controllare commit rewrites
- Identificare history modifications
- Vedere reflog entries

#### Commit Verification
- Verificare firma GPG dei commit
- Controllare verified commits
- Vedere unverified commits
- Verificare commit signature validity
- Controllare signing key information

### Context del Repository

#### Project Structure
- Leggere struttura completa del progetto
- Vedere directory tree
- Identificare root directory
- Controllare subdirectories structure
- Vedere file organization
- Identificare monorepo structure
- Controllare workspace configuration

#### Configuration Files
- Accedere a package.json
- Leggere tsconfig.json
- Vedere angular.json
- Controllare eslint.config.js
- Accedere a .prettierrc
- Vedere jest.config.js
- Controllare .editorconfig
- Accedere a .gitignore
- Vedere .gitattributes
- Controllare environment files

#### Dependencies
- Vedere package.json dependencies
- Controllare devDependencies
- Verificare peerDependencies
- Vedere optionalDependencies
- Controllare dependency versions
- Verificare lockfile (package-lock.json)
- Vedere installed packages versions
- Controllare outdated dependencies

#### Build & Tooling
- Accedere a build configuration
- Vedere scripts in package.json
- Controllare build targets
- Verificare compiler options
- Vedere bundler configuration
- Controllare optimization settings
- Verificare source maps configuration

#### Testing Configuration
- Leggere file di test esistenti
- Vedere test configuration
- Controllare test frameworks setup
- Verificare test runners configuration
- Vedere coverage configuration
- Controllare test environments
- Verificare mocking setup

#### Code Quality Tools
- Accedere a regole ESLint
- Vedere Prettier configuration
- Controllare TypeScript strict options
- Verificare linting rules
- Vedere formatting rules
- Controllare code analysis tools

#### Documentation
- Consultare README principale
- Vedere README per features
- Accedere a CONTRIBUTING guide
- Controllare CODE_OF_CONDUCT
- Vedere LICENSE file
- Accedere a CHANGELOG
- Controllare migration guides
- Vedere API documentation
- Accedere a architecture docs
- Controllare ADRs (Architecture Decision Records)

#### Version Control
- Vedere .git configuration
- Controllare git hooks
- Verificare .gitignore rules
- Vedere git attributes
- Controllare branch protection settings

#### CI/CD Configuration
- Accedere a workflow files
- Vedere GitHub Actions configuration
- Controllare pipeline definitions
- Verificare deployment scripts
- Vedere environment configurations

## 🔍 Analisi Codice

### Analisi Statica

#### Syntax Validation
- Verificare sintassi TypeScript valida
- Controllare sintassi JavaScript valida
- Verificare sintassi HTML template
- Controllare sintassi CSS/SCSS
- Verificare sintassi JSON
- Controllare sintassi YAML
- Verificare sintassi Markdown

#### ESLint Compliance
- Controllare conformità a tutte le regole ESLint
- Verificare no-unused-vars
- Controllare arrow-parens
- Verificare prefer-const
- Controllare no-var usage
- Verificare consistent return
- Controllare no-console
- Verificare no-debugger
- Controllare max-line-length
- Verificare indent rules
- Controllare quotes consistency
- Verificare semicolon usage
- Controllare trailing commas

#### Style Guide Violations
- Identificare violazioni naming conventions
- Controllare indentation consistency
- Verificare spacing rules
- Controllare bracket placement
- Identificare line length violations
- Verificare file naming conventions
- Controllare comment style
- Identificare formatting inconsistencies

#### Code Smells
- Rilevare duplicated code
- Identificare long methods
- Trovare large classes
- Rilevare god objects
- Identificare feature envy
- Trovare inappropriate intimacy
- Rilevare lazy classes
- Identificare speculative generality
- Trovare temporary fields
- Rilevare message chains
- Identificare middle man
- Trovare switch statements smell

#### Code Complexity
- Identificare complessità ciclomatica elevata
- Calcolare cognitive complexity
- Misurare nesting depth
- Identificare long parameter lists
- Calcolare method complexity
- Misurare class complexity
- Identificare coupling eccessivo
- Calcolare lack of cohesion

#### Code Duplication
- Trovare codice duplicato esatto
- Identificare duplicazione simile
- Rilevare copy-paste code
- Trovare duplicazione cross-file
- Identificare duplicazione in tests
- Rilevare magic numbers duplicati
- Trovare string literals duplicati

#### Function Analysis
- Rilevare funzioni troppo lunghe
- Identificare funzioni con troppi parametri
- Verificare single responsibility
- Controllare function naming
- Identificare functions senza return type
- Verificare pure functions
- Controllare side effects

#### Nesting Analysis
- Trovare nesting eccessivo
- Identificare deep if/else chains
- Rilevare nested loops
- Trovare nested callbacks
- Identificare pyramid of doom
- Verificare early returns opportunity

#### Variable Analysis
- Rilevare variabili non utilizzate
- Identificare variabili non inizializzate
- Trovare variabili shadowing
- Rilevare unused parameters
- Identificare unused imports
- Verificare const vs let usage
- Controllare variable naming

#### Dead Code
- Identificare codice unreachable
- Trovare funzioni non chiamate
- Rilevare classi non usate
- Identificare imports non usati
- Trovare exports non usati
- Rilevare commented code
- Identificare TODO/FIXME comments

### Type Safety

#### Type Annotations
- Verificare type annotations presenti
- Controllare function return types
- Verificare parameter types
- Controllare property types
- Verificare variable types
- Controllare generic type parameters
- Verificare index signatures

#### Any Type Usage
- Identificare uso di any
- Rilevare implicit any
- Trovare explicit any
- Identificare any in function parameters
- Rilevare any in return types
- Trovare any in properties
- Verificare any in generic constraints

#### Null Safety
- Controllare strict null checks attivo
- Verificare null/undefined checks
- Identificare potential null references
- Controllare optional chaining usage
- Verificare nullish coalescing
- Identificare non-null assertions
- Controllare default parameters for null

#### Type Assertions
- Rilevare type assertions non sicure
- Identificare as any casts
- Verificare unnecessary type assertions
- Controllare type assertion justification
- Identificare double assertions
- Verificare type guards preferiti a assertions

#### Generic Types
- Verificare generic types corretti
- Controllare generic constraints
- Verificare generic type inference
- Controllare generic type parameters naming
- Verificare generic type variance
- Controllare generic type defaults

#### Union Types
- Identificare union types mancanti
- Verificare discriminated unions
- Controllare exhaustive checking
- Verificare type narrowing
- Controllare union type ordering

#### Type Guards
- Controllare type guards implementazione
- Verificare typeof guards
- Controllare instanceof guards
- Verificare custom type guards
- Controllare type predicates
- Verificare narrowing effectiveness

#### Type Inference
- Verificare type inference funziona
- Controllare inference nelle generics
- Verificare contextual typing
- Controllare best common type
- Verificare return type inference

#### Type Widening
- Rilevare type widening problematico
- Identificare const assertions needed
- Verificare literal types preserved
- Controllare enum widening
- Identificare widening in arrays

#### Advanced Types
- Verificare mapped types usage
- Controllare conditional types
- Verificare template literal types
- Controllare utility types usage
- Verificare intersection types
- Controllare type aliases vs interfaces
- Verificare recursive types

### Angular Specific

#### Component Architecture
- Verificare pattern Smart/Dumb components
- Controllare container vs presentational
- Verificare component responsibilities
- Controllare component size
- Verificare component nesting depth
- Controllare input/output naming
- Verificare component composition

#### Dependency Injection
- Controllare uso corretto di inject()
- Verificare constructor injection vs inject
- Controllare providers configuration
- Verificare injection tokens
- Controllare providedIn configuration
- Verificare hierarchical injectors
- Controllare optional dependencies
- Verificare multi providers
- Controllare factory providers
- Verificare useValue vs useFactory

#### Change Detection
- Verificare OnPush strategy usage
- Controllare quando usare Default strategy
- Verificare ChangeDetectorRef usage
- Controllare manual change detection
- Verificare markForCheck usage
- Controllare detach/reattach
- Verificare Zone.js awareness

#### Signals
- Controllare uso di signal()
- Verificare computed() usage
- Controllare effect() usage appropriato
- Verificare toSignal() per Observable conversion
- Controllare toObservable() per Signal conversion
- Verificare signal equality comparison
- Controllare signal updates batching
- Verificare untracked() usage
- Controllare linked signals

#### Signals vs Observables
- Verificare quando usare Signals
- Controllare quando mantenere Observables
- Verificare migration pattern appropriato
- Controllare interoperability
- Verificare performance implications
- Controllare async operations handling

#### Standalone Components
- Verificare standalone: true
- Controllare imports array corretta
- Verificare nessun NgModule usage
- Controllare tree-shaking optimization
- Verificare lazy loading con standalone

#### Lazy Loading
- Controllare lazy loading configuration
- Verificare loadChildren() usage
- Controllare route configuration
- Verificare preloading strategy
- Controllare bundle optimization
- Verificare shared modules non lazy loaded

#### Route Guards
- Verificare guard implementazione corretta
- Controllare CanActivate guards
- Verificare CanDeactivate guards
- Controllare CanMatch guards
- Verificare resolve guards
- Controllare functional guards
- Verificare guard injection
- Controllare guard return types

#### Forms
- Controllare form validation implementation
- Verificare reactive forms vs template-driven
- Controllare FormControl typing
- Verificare validators usage
- Controllare async validators
- Verificare custom validators
- Controllare form submission handling
- Verificare form reset logic
- Controllare dynamic forms
- Verificare FormArray usage
- Controllare FormGroup nesting

#### Template Syntax
- Verificare template syntax corretta
- Controllare structural directives usage
- Verificare property binding
- Controllare event binding
- Verificare two-way binding
- Controllare template reference variables
- Verificare template expressions
- Controllare safe navigation operator
- Verificare async pipe usage
- Controllare control flow syntax (@if, @for, @switch)

#### Lifecycle Hooks
- Controllare lifecycle hooks usage corretti
- Verificare ngOnInit implementation
- Controllare ngOnDestroy cleanup
- Verificare ngOnChanges usage
- Controllare ngAfterViewInit
- Verificare ngAfterContentInit
- Controllare hook ordering
- Verificare hook performance

#### Services
- Verificare Service providedIn configuration
- Controllare singleton services
- Verificare scoped services
- Controllare service responsibilities
- Verificare service injection
- Controllare service lifecycle
- Verificare service testing

#### Module Organization
- Controllare module imports corretti
- Verificare module exports
- Controllare declarations
- Verificare providers array
- Controllare shared modules
- Verificare core module pattern
- Controllare feature modules

#### State Management
- Verificare NgRx patterns corretti
- Controllare actions definition
- Verificare reducers purity
- Controllare effects implementation
- Verificare selectors usage
- Controllare store organization
- Verificare state immutability
- Controllare signals-based state
- Verificare component store usage

#### HTTP
- Controllare HTTP interceptors implementation
- Verificare HttpClient usage
- Controllare error handling in HTTP
- Verificare request cancellation
- Controllare retry logic
- Verificare timeout configuration
- Controllare HTTP headers
- Verificare request/response typing

#### RxJS Integration
- Verificare RxJS operators usage in Angular
- Controllare subscription management
- Verificare async pipe preferito
- Controllare takeUntilDestroyed usage
- Verificare observable chains
- Controllare error handling

### RxJS & Reactive Programming

#### Subscription Management
- Verificare che ogni subscription abbia un unsubscribe
- Identificare subscriptions senza cleanup nel ngOnDestroy
- Controllare uso corretto di takeUntil pattern
- Verificare uso di takeUntilDestroyed in standalone components
- Controllare che Subject destroy$ sia completato
- Identificare subscriptions in costruttori
- Verificare subscriptions in services singleton
- Controllare subscription arrays per cleanup multipli
- Identificare subscriptions in loops
- Verificare async pipe preferito a manual subscription

#### Memory Leaks Detection
- Identificare subscriptions non terminate in components
- Rilevare event listeners non rimossi
- Controllare interval/timer non cancellati
- Verificare WebSocket connections non chiuse
- Identificare DOM references non rilasciate
- Controllare closures che mantengono references
- Rilevare cache non pulite
- Verificare listeners su window/document non rimossi
- Identificare subscriptions in services scoped

#### Operators Usage
- Verificare operators chain logica e ordine
- Controllare uso appropriato di map vs switchMap
- Verificare mergeMap per operazioni parallele
- Controllare concatMap per operazioni sequenziali
- Verificare exhaustMap per ignore overlapping
- Controllare uso di filter prima di map
- Verificare distinctUntilChanged per evitare duplicati
- Controllare debounceTime per user input
- Verificare throttleTime per eventi frequenti
- Controllare catchError per error handling
- Verificare retry/retryWhen per resilienza
- Controllare finalize per cleanup operations
- Verificare tap solo per side effects
- Controllare shareReplay per multiple subscriptions
- Verificare startWith per valori iniziali
- Controllare combineLatest vs forkJoin vs zip
- Verificare withLatestFrom per combining streams

#### Hot vs Cold Observables
- Identificare cold observables condivisi erroneamente
- Verificare uso di share() per hot observables
- Controllare shareReplay() con refCount
- Verificare multicast per custom sharing
- Identificare subscriptions multiple su HTTP calls
- Controllare publish/connect pattern
- Verificare Subject come hot observable

#### Subject Types
- Verificare uso appropriato di Subject
- Controllare BehaviorSubject per state with initial value
- Verificare ReplaySubject per history replay
- Controllare AsyncSubject per last value only
- Identificare Subject usage invece di EventEmitter
- Verificare Subject complete() chiamato
- Controllare Subject error handling

#### Error Handling
- Verificare catchError in ogni stream
- Controllare error propagation corretta
- Verificare error handling non interrompe stream
- Controllare retry logic per errors transitori
- Verificare error messages informativi
- Controllare error logging
- Verificare fallback values per errors
- Controllare error notification all'utente

#### Async Pipe
- Verificare preferenza async pipe vs manual subscription
- Controllare async pipe in template per auto-unsubscribe
- Verificare null checks con async pipe
- Controllare as syntax per type safety
- Identificare multiple async pipes sullo stesso observable
- Verificare shareReplay quando async pipe multipli

#### Nested Subscriptions
- Identificare subscriptions dentro subscriptions
- Verificare uso di switchMap invece di nested subscribe
- Controllare mergeMap/concatMap per chaining
- Identificare pyramid of doom
- Verificare flatMap pattern appropriato

#### Performance
- Identificare subscriptions in ngDoCheck
- Verificare observable creations in template
- Controllare operators pesanti in chain frequenti
- Identificare shareReplay senza refCount
- Verificare scan vs reduce per accumulation
- Controllare buffer operations per batch processing

#### Testing
- Verificare marble testing per observables
- Controllare TestScheduler usage
- Verificare mock observables
- Controllare async testing
- Verificare subscription assertions
- Controllare timing tests

### Performance

#### Bottleneck Identification
- Identificare operazioni sincrone costose nel main thread
- Rilevare blocking operations
- Trovare long-running functions
- Identificare CPU-intensive operations
- Rilevare layout thrashing
- Trovare forced synchronous layouts
- Identificare render blocking resources

#### Lazy Loading
- Verificare lazy loading implementato per routes
- Controllare lazy loading per immagini
- Verificare lazy loading per components
- Controllare code splitting effectiveness
- Verificare dynamic imports
- Controllare chunk optimization
- Verificare preload strategies

#### Bundle Size
- Controllare bundle size totale
- Verificare chunk sizes individuali
- Identificare large dependencies
- Controllare tree-shaking effectiveness
- Verificare dead code elimination
- Controllare module concatenation
- Identificare duplicate code in bundles
- Verificare vendor bundle optimization
- Controllare dynamic imports impact

#### Re-rendering
- Identificare re-rendering eccessivi in components
- Verificare change detection triggers
- Controllare pure components usage
- Identificare unnecessary renders
- Verificare shouldComponentUpdate equivalent
- Controllare memo usage appropriato
- Identificare render bottlenecks

#### Memoization
- Verificare memoization opportunities
- Controllare pure pipes usage
- Identificare expensive computations da memoizzare
- Verificare cache strategies
- Controllare computed values
- Identificare repeated calculations
- Verificare selector memoization

#### Pure Pipes
- Controllare uso di pure pipes
- Verificare pipe purity
- Identificare impure pipes usage
- Controllare pipe performance
- Verificare pipe caching
- Identificare pipes in ngFor

#### API Calls
- Identificare chiamate API ridondanti
- Verificare request deduplication
- Controllare caching di responses
- Identificare sequential calls parallelizzabili
- Verificare request batching
- Controllare pagination implementation
- Identificare overfetching data
- Verificare prefetching strategies

#### Caching
- Verificare caching strategies implementate
- Controllare cache invalidation
- Verificare cache size limits
- Controllare cache expiration
- Identificare stale cache data
- Verificare cache hit/miss ratio
- Controllare local storage usage
- Verificare service worker caching

#### Image Optimization
- Controllare image compression
- Verificare responsive images
- Controllare lazy loading immagini
- Verificare format appropriato (WebP, AVIF)
- Controllare image dimensions
- Verificare srcset usage
- Controllare CDN usage for images
- Identificare large images

#### Asset Optimization
- Controllare minification di assets
- Verificare compression (gzip, brotli)
- Controllare asset caching headers
- Verificare font optimization
- Controllare CSS optimization
- Verificare JavaScript minification
- Controllare resource hints (preload, prefetch)

#### Memory Management
- Identificare memory leaks
- Verificare garbage collection patterns
- Controllare object retention
- Identificare detached DOM nodes
- Verificare event listener cleanup
- Controllare closure memory usage
- Identificare large objects in memory

#### Network Performance
- Verificare HTTP/2 usage
- Controllare connection pooling
- Verificare request prioritization
- Controllare resource loading order
- Verificare critical rendering path
- Controllare waterfall optimization

### Security

#### Secrets Management
- Rilevare API keys hardcoded
- Identificare passwords hardcoded
- Trovare tokens hardcoded
- Rilevare connection strings hardcoded
- Identificare private keys nel codice
- Trovare credentials in config files
- Rilevare secrets in environment files
- Identificare secrets in comments
- Trovare secrets in test files

#### XSS Prevention
- Identificare XSS vulnerabilities
- Verificare input sanitization
- Controllare output encoding
- Verificare DOM manipulation sicura
- Controllare innerHTML usage
- Verificare template injection prevention
- Controllare script injection prevention
- Verificare attribute injection prevention
- Controllare URL injection prevention

#### SQL Injection
- Controllare parameterized queries usage
- Verificare ORM usage corretto
- Identificare string concatenation in queries
- Controllare stored procedures usage
- Verificare input validation per queries
- Identificare dynamic SQL construction

#### CSRF Protection
- Verificare CSRF tokens implementati
- Controllare SameSite cookie attribute
- Verificare Origin header validation
- Controllare Referer header validation
- Verificare CORS configuration per CSRF
- Controllare state-changing operations protection

#### Authentication
- Rilevare authentication bypass vulnerabilities
- Verificare password hashing appropriato
- Controllare session management sicuro
- Verificare JWT implementation corretta
- Controllare token expiration
- Verificare refresh token security
- Controllare multi-factor authentication
- Verificare password complexity enforcement

#### Authorization
- Controllare authorization checks presenti
- Verificare role-based access control
- Controllare permission checks
- Identificare privilege escalation risks
- Verificare resource-level authorization
- Controllare API endpoint protection
- Verificare route guards authorization

#### Path Traversal
- Identificare path traversal risks
- Verificare file path validation
- Controllare directory traversal prevention
- Verificare file upload security
- Controllare file download security
- Identificare file inclusion vulnerabilities

#### Input Validation
- Verificare input validation presente
- Controllare whitelist validation
- Verificare regex validation security
- Controllare type checking
- Verificare range validation
- Controllare length validation
- Verificare format validation
- Controllare business logic validation

#### Output Encoding
- Controllare output encoding corretto
- Verificare HTML encoding
- Controllare JavaScript encoding
- Verificare URL encoding
- Controllare CSS encoding
- Verificare JSON encoding

#### Dependency Security
- Rilevare insecure dependencies
- Identificare known vulnerabilities (CVE)
- Verificare dependency versions outdated
- Controllare transitive dependencies vulnerabilities
- Verificare dependency license compliance
- Controllare deprecated dependencies
- Identificare malicious packages

#### CORS Configuration
- Verificare CORS headers corretti
- Controllare Access-Control-Allow-Origin
- Verificare Access-Control-Allow-Methods
- Controllare Access-Control-Allow-Headers
- Verificare credentials handling
- Controllare preflight requests
- Identificare CORS misconfiguration

#### Cookie Security
- Controllare secure cookie attribute
- Verificare HttpOnly flag
- Controllare SameSite attribute
- Verificare cookie expiration
- Controllare cookie domain
- Verificare cookie path
- Identificare sensitive data in cookies

#### Data Exposure
- Identificare sensitive data exposure
- Verificare PII (Personally Identifiable Information) handling
- Controllare data masking
- Verificare encryption at rest
- Controllare encryption in transit
- Verificare secure communication (HTTPS)
- Identificare data leakage in logs
- Controllare error messages information disclosure

#### Cryptography
- Verificare algoritmi crittografici sicuri
- Controllare key length appropriato
- Verificare random number generation sicuro
- Controllare salt usage per hashing
- Verificare IV (Initialization Vector) usage
- Controllare certificate validation
- Identificare weak cryptography

### Accessibility

#### Semantic HTML
- Verificare uso di semantic HTML5 elements
- Controllare header tags (h1-h6) gerarchia
- Verificare nav element per navigation
- Controllare main element per main content
- Verificare aside per content secondario
- Controllare article elements appropriati
- Verificare section elements
- Controllare footer elements
- Verificare landmark regions

#### ARIA Attributes
- Controllare ARIA labels presenti
- Verificare aria-label usage
- Controllare aria-labelledby references
- Verificare aria-describedby
- Controllare aria-hidden appropriato
- Verificare aria-live regions
- Controllare aria-expanded
- Verificare aria-selected
- Controllare aria-checked
- Verificare aria-disabled
- Controllare aria-required
- Verificare aria-invalid
- Controllare role attributes corretti

#### Keyboard Navigation
- Verificare keyboard navigation completa
- Controllare focus management
- Verificare tab order logico
- Controllare tabindex appropriato
- Verificare focus visible
- Controllare focus trap in modals
- Verificare skip links
- Controllare keyboard shortcuts
- Verificare escape key handling

#### Screen Reader
- Controllare screen reader compatibility
- Verificare text alternatives per images
- Controllare announcements appropriate
- Verificare context for actions
- Controllare form field descriptions
- Verificare error message announcements
- Controllare dynamic content announcements
- Verificare table headers association

#### Color Contrast
- Verificare color contrast ratio (WCAG AA/AAA)
- Controllare text contrast
- Verificare icon contrast
- Controllare interactive element contrast
- Identificare contrast issues
- Verificare contrast in different states
- Controllare contrast in charts/graphs

#### Focus Management
- Controllare focus indicators visibili
- Verificare focus order logico
- Controllare focus restoration
- Verificare focus trap quando necessario
- Controllare focus styling
- Verificare no outline removal senza alternative
- Controllare focus-within usage

#### Form Accessibility
- Verificare form labels associate
- Controllare label for attribute
- Verificare fieldset e legend usage
- Controllare error message association
- Verificare required field indication
- Controllare autocomplete attributes
- Verificare input type appropriati
- Controllare placeholder non come label

#### Image Accessibility
- Controllare alt text per tutte le immagini
- Verificare alt text descrittivi
- Controllare decorative images (alt="")
- Verificare complex images description
- Controllare figure e figcaption
- Verificare SVG accessibility
- Controllare icon accessibility

#### Heading Hierarchy
- Verificare heading hierarchy corretta
- Controllare no h1 multipli
- Verificare no salti di livello
- Controllare headings descrittivi
- Verificare heading structure logica

#### Responsive Design
- Controllare responsive per tutti i viewport
- Verificare mobile accessibility
- Controllare touch target size
- Verificare zoom support
- Controllare orientation changes
- Verificare text reflow
- Controllare no horizontal scroll

#### Dynamic Content
- Verificare ARIA live regions per updates
- Controllare announcements timing
- Verificare loading state accessibility
- Controllare error state accessibility
- Verificare success message accessibility

## 🧪 Testing & Quality

### Test Coverage

#### Coverage Metrics
- Calcolare coverage percentuale globale
- Misurare line coverage
- Calcolare branch coverage
- Misurare function coverage
- Calcolare statement coverage
- Verificare coverage per file
- Controllare coverage per directory
- Identificare coverage trends

#### Uncovered Code
- Identificare file completamente senza test
- Trovare funzioni senza test
- Identificare branches non testati
- Rilevare edge cases non coperti
- Trovare error paths non testati
- Identificare conditional logic non testato

#### Service Testing
- Verificare test per ogni service pubblico
- Controllare test per service methods
- Verificare test per service dependencies
- Controllare test per service state
- Verificare test per service lifecycle
- Controllare mock dependencies in service tests

#### Component Testing
- Controllare test per ogni component
- Verificare test per component inputs
- Controllare test per component outputs
- Verificare test per component state
- Controllare test per component lifecycle
- Verificare test per component templates
- Controllare test per component styles
- Verificare test per user interactions

#### Guard Testing
- Verificare test per route guards
- Controllare test per guard logic
- Verificare test per guard dependencies
- Controllare test per guard return values
- Verificare test per async guards

#### Edge Cases
- Identificare edge cases non testati
- Verificare boundary value testing
- Controllare null/undefined handling tests
- Verificare empty array/object tests
- Controllare maximum/minimum value tests
- Verificare special character tests

#### Error Scenarios
- Controllare test per error scenarios
- Verificare test per exception handling
- Controllare test per network errors
- Verificare test per validation errors
- Controllare test per timeout scenarios
- Verificare test per race conditions

#### Integration Testing
- Verificare integration tests presenti
- Controllare test per component integration
- Verificare test per service integration
- Controllare test per API integration
- Verificare test per routing integration
- Controllare test per state management integration

#### E2E Coverage
- Controllare E2E test coverage per critical paths
- Verificare E2E per user flows
- Controllare E2E per business logic
- Verificare E2E per authentication flows
- Controllare E2E per form submissions
- Verificare E2E per navigation

### Test Quality

#### Naming Conventions
- Verificare test naming descrittivo
- Controllare describe blocks chiari
- Verificare it blocks specifici
- Controllare naming pattern consistency
- Verificare test grouped logicamente

#### Test Organization
- Controllare test organization con describe/it
- Verificare describe nesting appropriato
- Controllare beforeEach/afterEach usage
- Verificare test file organization
- Controllare test suites grouping

#### Test Duplication
- Identificare test duplicati
- Rilevare test logic duplicata
- Trovare assertion duplications
- Identificare setup duplicato
- Verificare helper functions per DRY

#### Test Isolation
- Verificare test isolation completo
- Controllare no shared state tra tests
- Verificare cleanup dopo ogni test
- Controllare test order independence
- Verificare no side effects
- Controllare database reset tra tests

#### Mocking
- Controllare mock/stub usage appropriato
- Verificare spy usage corretto
- Controllare fake objects
- Verificare mock implementation
- Controllare mock verification
- Verificare mock reset tra tests
- Controllare dependency injection for mocking

#### Assertions
- Verificare assertion completezza
- Controllare assertion specificity
- Verificare custom matchers usage
- Controllare assertion messages
- Verificare no assertion omesse
- Controllare assertion order
- Verificare expect vs assert

#### Flaky Tests
- Identificare test flaky
- Rilevare test con timing issues
- Trovare test con race conditions
- Identificare test dipendenti da external state
- Rilevare test con random failures
- Verificare async test handling

#### Test Performance
- Controllare test execution time
- Identificare slow tests
- Verificare test parallelization
- Controllare test optimization
- Verificare unnecessary setup
- Controllare mock performance

#### Setup/Teardown
- Verificare setup corretti in beforeEach
- Controllare teardown in afterEach
- Verificare setup completo
- Controllare cleanup completo
- Verificare no memory leaks in tests
- Controllare test fixtures appropriati

#### Test Data
- Verificare test data appropriati
- Controllare fixture data
- Verificare test data variety
- Controllare realistic test data
- Verificare test data isolation

## 📝 Documentation

### Code Documentation

#### JSDoc Comments
- Verificare JSDoc comments per classi pubbliche
- Controllare JSDoc per metodi pubblici
- Verificare JSDoc per proprietà pubbliche
- Controllare JSDoc format corretto
- Verificare JSDoc completeness

#### TSDoc
- Controllare TSDoc per funzioni pubbliche
- Verificare TSDoc per interfaces
- Controllare TSDoc per types
- Verificare TSDoc per enums
- Controllare TSDoc tags usage

#### Parameter Documentation
- Verificare parametri documentati
- Controllare @param tags
- Verificare parameter types documented
- Controllare parameter descriptions
- Verificare optional parameters marked

#### Return Documentation
- Controllare return types documentati
- Verificare @returns/@return tags
- Controllare return value descriptions
- Verificare promise return documentation
- Controllare observable return documentation

#### Usage Examples
- Verificare esempi di uso presenti
- Controllare @example tags
- Verificare code examples corretti
- Controllare examples completeness
- Verificare examples variety

#### Deprecation
- Controllare deprecation notices
- Verificare @deprecated tags
- Controllare alternative suggested
- Verificare deprecation timeline
- Controllare migration path documented

#### Throws Documentation
- Verificare @throws documentation
- Controllare exception types documented
- Verificare error conditions documented
- Controllare error examples

#### Cross References
- Controllare @see references
- Verificare @link tags
- Controllare internal references
- Verificare external documentation links

### Project Documentation

#### README
- Verificare README aggiornato con ultime features
- Controllare README completeness
- Verificare installation instructions
- Controllare usage examples
- Verificare prerequisites listed
- Controllare troubleshooting section
- Verificare contributing guidelines link
- Controllare license information
- Verificare badges updated

#### CHANGELOG
- Controllare CHANGELOG entry per PR
- Verificare version number
- Controllare release date
- Verificare changes categorized
- Controllare breaking changes highlighted
- Verificare deprecations listed
- Controllare bug fixes listed
- Verificare new features listed

#### Migration Guide
- Verificare migration guide se breaking changes
- Controllare step-by-step instructions
- Verificare code examples before/after
- Controllare deprecation warnings
- Verificare upgrade path
- Controllare backwards compatibility notes

#### API Documentation
- Controllare API documentation updated
- Verificare endpoint documentation
- Controllare request/response examples
- Verificare error codes documented
- Controllare authentication documented
- Verificare rate limiting documented

#### Architecture Docs
- Verificare architecture decision records
- Controllare system design documentation
- Verificare component diagrams
- Controllare data flow documentation
- Verificare architecture principles
- Controllare technology stack documented

#### User Guide
- Controllare user guide updates
- Verificare feature documentation
- Controllare screenshots updated
- Verificare tutorials current
- Controllare FAQ updated

#### Deployment Docs
- Verificare deployment documentation
- Controllare environment setup
- Verificare build instructions
- Controllare deployment steps
- Verificare rollback procedures
- Controllare monitoring setup

## 🏗️ Architecture & Design

### Design Patterns

#### SOLID Principles
- Verificare Single Responsibility Principle
- Controllare Open/Closed Principle
- Verificare Liskov Substitution Principle
- Controllare Interface Segregation Principle
- Verificare Dependency Inversion Principle

#### DRY Violations
- Controllare Don't Repeat Yourself violations
- Identificare codice duplicato
- Rilevare logic duplicata
- Trovare configuration duplicata
- Identificare validation duplicata

#### Single Responsibility
- Identificare violazioni SRP in classi
- Verificare responsabilità unica per components
- Controllare responsabilità unica per services
- Identificare god classes
- Verificare mixed concerns

#### Dependency Inversion
- Verificare dipendenze su abstractions
- Controllare dependency injection usage
- Verificare interfacce per dependencies
- Controllare coupling direction
- Verificare plugin architecture

#### Interface Segregation
- Controllare interfacce focused
- Verificare no fat interfaces
- Controllare client-specific interfaces
- Identificare interfacce troppo ampie

#### Design Patterns Usage
- Verificare design patterns appropriati
- Controllare Factory pattern usage
- Verificare Observer pattern
- Controllare Strategy pattern
- Verificare Decorator pattern
- Controllare Singleton pattern appropriato
- Verificare Builder pattern
- Controllare Adapter pattern
- Controllare Facade pattern

#### Anti-Patterns
- Identificare anti-patterns comuni
- Rilevare God Object
- Trovare Spaghetti Code
- Identificare Lava Flow
- Rilevare Golden Hammer
- Trovare Copy-Paste Programming
- Identificare Magic Numbers/Strings
- Rilevare Hard Coding

#### Separation of Concerns
- Verificare separation of concerns
- Controllare business logic separata da UI
- Verificare data access separato
- Controllare presentation logic separata
- Verificare cross-cutting concerns handled

### Project Structure

#### Folder Structure
- Verificare folder structure conventions rispettate
- Controllare feature-based organization
- Verificare shared/common folders appropriati
- Controllare core folder organization
- Verificare assets organization
- Controllare test files colocation

#### File Naming
- Controllare file naming conventions
- Verificare kebab-case per files
- Controllare component suffix (.component.ts)
- Verificare service suffix (.service.ts)
- Controllare module suffix (.module.ts)
- Verificare spec suffix (.spec.ts)
- Controllare model suffix (.model.ts)

#### Module Organization
- Verificare module organization logica
- Controllare feature modules structure
- Verificare shared modules appropriati
- Controllare core module pattern
- Verificare lazy loaded modules
- Controllare module dependencies

#### Feature Modules
- Controllare feature modules structure corretta
- Verificare feature isolation
- Controllare feature public API
- Verificare feature dependencies minimali
- Controllare feature routing modules

#### Shared/Core Modules
- Verificare shared modules per codice riutilizzabile
- Controllare core module per singleton services
- Verificare no business logic in shared
- Controllare core imported solo in AppModule
- Verificare shared imported dove necessario

#### Import Paths
- Controllare import paths consistency
- Verificare path aliases usage (@app, @shared)
- Controllare relative imports depth
- Verificare barrel exports usage appropriato
- Identificare import path smell

#### Circular Dependencies
- Verificare no circular dependencies
- Identificare dependency cycles
- Controllare module dependency graph
- Rilevare circular imports
- Verificare dependency direction

#### Barrel Exports
- Controllare barrel exports (index.ts)
- Verificare public API exports
- Controllare export organization
- Verificare no export everything
- Controllare tree-shaking friendly exports

### API Design

#### RESTful Conventions
- Verificare RESTful conventions rispettate
- Controllare resource naming
- Verificare URL structure
- Controllare HTTP verbs appropriati
- Verificare status codes corretti
- Controllare idempotency
- Verificare stateless operations

#### HTTP Methods
- Controllare HTTP methods appropriati
- Verificare GET per reads
- Controllare POST per creates
- Verificare PUT per full updates
- Controllare PATCH per partial updates
- Verificare DELETE per deletes
- Controllare HEAD/OPTIONS usage

#### Response Formats
- Verificare response formats consistent
- Controllare JSON structure
- Verificare response envelopes
- Controllare nested resources
- Verificare null vs missing fields
- Controllare date format consistency
- Verificare enum values format

#### Error Responses
- Controllare error responses standardized
- Verificare error status codes appropriati
- Controllare error message format
- Verificare error details included
- Controllare validation errors structured
- Verificare error codes defined

#### API Versioning
- Controllare API versioning strategy
- Verificare version in URL vs header
- Controllare backwards compatibility
- Verificare deprecation strategy
- Controllare version documentation

#### Pagination
- Controllare pagination implementation
- Verificare page-based vs cursor-based
- Controllare pagination metadata
- Verificare total count included
- Controllare next/previous links
- Verificare page size limits

#### Filtering
- Verificare filtering implementation
- Controllare query parameters for filters
- Verificare filter combinations
- Controllare filter validation
- Verificare filter documentation

#### Sorting
- Controllare sorting implementation
- Verificare sort parameters
- Controllare multi-field sorting
- Verificare sort direction
- Controllare default sorting

#### Authentication/Authorization
- Controllare authentication mechanism
- Verificare authorization checks
- Controllare token-based auth
- Verificare OAuth2 implementation
- Controllare API key usage
- Verificare permission model

## 💬 Comunicazione & Feedback

### Review Comments

#### General Comments
- Postare commenti generali overview della PR
- Fornire summary delle findings
- Evidenziare overall architecture concerns
- Commentare su PR scope
- Fornire context generale
- Suggerire overall improvements

#### Inline Comments
- Aggiungere commenti inline su linee specifiche
- Commentare su specific code issues
- Evidenziare bugs su linee specifiche
- Suggerire fix inline
- Richiedere clarifications su codice specifico
- Evidenziare best practices violations

#### Code Suggestions
- Suggerire modifiche di codice specifiche
- Proporre alternative implementations
- Fornire code snippets come esempi
- Suggerire refactoring opportunities
- Proporre performance improvements
- Suggerire simplifications

#### Clarification Requests
- Richiedere chiarimenti su implementazione
- Domandare su design decisions
- Richiedere spiegazioni per complex code
- Domandare su naming choices
- Richiedere context per changes

#### Alternative Proposals
- Proporre approcci alternativi
- Suggerire design pattern diversi
- Proporre architetture alternative
- Suggerire librerie alternative
- Proporre workflow alternativi

#### Best Practices
- Evidenziare best practices applicabili
- Linkare a style guides
- Citare coding standards
- Riferire a framework guidelines
- Condividere industry practices

#### Documentation Links
- Linkare a documentazione rilevante
- Riferire a API docs
- Linkare a tutorial esterni
- Citare official documentation
- Condividere learning resources

#### Reviewer Tagging
- Taggare altri reviewers per expertise
- Richiedere review da subject matter experts
- Taggare team leads per approvals
- Coinvolgere security reviewers
- Taggare documentation reviewers

### Review Status

#### Approval
- Approvare PR quando soddisfa criteri
- Fornire approval con commenti
- Approvare con minor suggestions
- Approvare condizionatamente

#### Request Changes
- Richiedere modifiche per issues critici
- Specificare modifiche richieste
- Prioritizzare modifiche necessarie
- Bloccare merge fino a fixes

#### Comment Only
- Commentare senza approval/rejection
- Fornire feedback informativo
- Suggerire improvements opzionali
- Condividere observations

#### Review Summary
- Aggiungere review summary complessivo
- Riassumere findings principali
- Elencare action items
- Fornire overall assessment
- Suggerire next steps

#### Change Checklist
- Creare checklist di modifiche richieste
- Elencare tutti i fixes necessari
- Organizzare per priority
- Tracciare completion status
- Aggiornare checklist as resolved

#### Feedback Prioritization
- Prioritizzare feedback come critical
- Classificare come major issues
- Identificare minor improvements
- Marcare come nits (suggestions)
- Distinguere blocking vs non-blocking

### Issue Creation

#### Bug Issues
- Creare issue per problemi trovati
- Descrivere bug dettagliatamente
- Fornire steps to reproduce
- Includere expected vs actual behavior
- Aggiungere screenshots se rilevanti

#### Issue Linking
- Linkare issue alla PR
- Riferire PR negli issues
- Cross-reference related issues
- Chiudere issues automaticamente
- Tracciare issue resolution

#### Improvement Issues
- Creare issue per miglioramenti futuri
- Suggerire enhancements
- Proporre nuove features
- Documentare ideas
- Prioritizzare improvements

#### Tech Debt Issues
- Creare issue per tech debt identificato
- Documentare code smells
- Tracciare refactoring needs
- Elencare cleanup tasks
- Prioritizzare tech debt

#### Label Assignment
- Assegnare label appropriate agli issues
- Usare bug/enhancement labels
- Applicare priority labels
- Assegnare component labels
- Usare status labels

#### Milestone Assignment
- Assegnare milestone agli issues
- Pianificare per releases
- Raggruppare related issues
- Tracciare milestone progress

#### Assignee Management
- Assegnare responsabili per issues
- Distribuire workload
- Tracciare ownership
- Rotare assignments

## 🔄 Workflow & Process

### PR Management

#### Reviewer Management
- Richiedere reviewers aggiuntivi
- Rimuovere reviewers non più necessari
- Assegnare reviewers based on expertise
- Distribuire review load
- Tracciare reviewer response time

#### Label Management
- Modificare label della PR
- Aggiungere status labels
- Applicare priority labels
- Assegnare type labels (feature, bug, etc.)
- Usare workflow labels

#### Milestone Management
- Modificare milestone della PR
- Assegnare a sprint corrente
- Rimuovere da milestone
- Tracciare milestone progress

#### Assignee Management
- Cambiare assignees della PR
- Assegnare owner
- Distribuire ownership
- Tracciare responsibility

#### Description Updates
- Aggiornare descrizione PR
- Aggiungere context mancante
- Includere screenshots
- Linkare related resources
- Aggiornare checklist

#### Title Updates
- Modificare titolo PR per clarity
- Seguire title conventions
- Includere issue reference
- Aggiungere scope prefix
- Marcare WIP in title

#### Draft Conversion
- Convertire draft in ready for review
- Marcare come draft se WIP
- Tracciare draft status
- Notificare quando ready

#### WIP Marking
- Marcare PR come work in progress
- Indicare incomplete work
- Bloccare merge premature
- Comunicare status

### Merge Operations

#### Conflict Detection
- Verificare merge conflicts presenti
- Identificare file in conflitto
- Analizzare natura dei conflitti
- Stimare complexity di resolution

#### Merge Strategy
- Suggerire strategia di merge appropriata
- Raccomandare merge commit
- Suggerire squash per feature branches
- Raccomandare rebase per linear history
- Valutare pros/cons di ogni strategia

#### Merge Prerequisites
- Verificare prerequisiti per merge soddisfatti
- Controllare tutti checks passed
- Verificare approvals ottenuti
- Controllare conflicts risolti
- Verificare branch updated

#### Required Checks
- Controllare required checks tutti passed
- Verificare CI/CD success
- Controllare tests passed
- Verificare lint passed
- Controllare build success
- Verificare security scans passed

#### Approval Requirements
- Verificare approval requirements soddisfatti
- Controllare numero di approvals
- Verificare approvals da CODEOWNERS
- Controllare no requested changes outstanding
- Verificare stale reviews dismissed

### CI/CD Integration

#### Build Results
- Leggere risultati build completi
- Vedere build logs
- Identificare build errors
- Controllare build warnings
- Verificare build artifacts
- Vedere build duration

#### Test Results
- Verificare test results dettagliati
- Vedere test successes/failures
- Controllare test logs
- Identificare failing tests
- Vedere flaky tests
- Controllare test duration
- Verificare test coverage changes

#### Lint Results
- Controllare lint results
- Vedere lint errors
- Controllare lint warnings
- Identificare lint violations
- Vedere lint fixed automatically
- Controllare lint configuration used

#### Coverage Reports
- Vedere coverage reports completi
- Controllare coverage percentage
- Identificare coverage decrease
- Vedere coverage per file
- Controllare uncovered lines
- Verificare coverage thresholds met

#### Deployment Previews
- Verificare deployment previews disponibili
- Vedere preview URLs
- Controllare preview status
- Testare preview environment
- Verificare preview logs

#### Security Scans
- Controllare security scan results
- Vedere vulnerabilities trovate
- Controllare severity levels
- Identificare affected dependencies
- Vedere remediation suggestions
- Controllare false positives

#### Performance Benchmarks
- Vedere performance benchmarks results
- Controllare performance regressions
- Vedere performance improvements
- Confrontare con baseline
- Identificare performance bottlenecks
- Controllare bundle size changes

## 📊 Metrics & Reporting

### Code Metrics

#### Lines of Code
- Calcolare lines of code changed
- Contare additions
- Contare deletions
- Calcolare net change
- Misurare LoC per file
- Confrontare con PR size guidelines

#### Cyclomatic Complexity
- Misurare complessità ciclomatica per function
- Calcolare average complexity
- Identificare high complexity functions
- Confrontare con thresholds
- Tracciare complexity trends

#### Maintainability Index
- Calcolare maintainability index
- Misurare code maintainability
- Identificare low maintainability code
- Confrontare con standards
- Tracciare maintainability over time

#### Code Churn
- Misurare code churn (lines changed)
- Calcolare churn rate
- Identificare high churn areas
- Analizzare churn patterns
- Correlate churn con bugs

#### Technical Debt
- Calcolare technical debt
- Stimare remediation time
- Prioritizzare tech debt
- Tracciare tech debt accumulation
- Misurare tech debt ratio

#### Coupling & Cohesion
- Misurare coupling tra moduli
- Calcolare cohesion all'interno moduli
- Identificare tight coupling
- Trovare low cohesion
- Suggerire decoupling

### PR Metrics

#### Review Time
- Calcolare tempo di review totale
- Misurare time to first review
- Calcolare average review time
- Tracciare review delays
- Identificare review bottlenecks

#### Comment Count
- Misurare numero di commenti totali
- Contare commenti per reviewer
- Calcolare average comments per PR
- Tracciare comment trends
- Identificare discussion intensity

#### Iteration Count
- Calcolare numero di iterazioni (push cycles)
- Misurare rework frequency
- Contare review cycles
- Tracciare iteration patterns
- Identificare excessive iterations

#### Time to Merge
- Misurare time to merge dalla creazione
- Calcolare average time to merge
- Tracciare merge delays
- Identificare long-running PRs
- Confrontare con targets

#### PR Size
- Verificare size della PR (small/medium/large)
- Calcolare change magnitude
- Classificare PR size
- Identificare oversized PRs
- Suggerire splitting large PRs

### Team Metrics

#### Active Contributors
- Identificare contributori attivi nel periodo
- Contare contributors unici
- Vedere contribution frequency
- Tracciare new contributors
- Misurare contributor retention

#### Work Distribution
- Verificare distribution del lavoro nel team
- Misurare commits per contributor
- Calcolare PRs per contributor
- Identificare workload imbalance
- Tracciare contribution patterns

#### Review Load
- Calcolare review load per reviewer
- Misurare reviews per reviewer
- Identificare overloaded reviewers
- Distribuire review responsibility
- Tracciare reviewer capacity

#### Collaboration Patterns
- Misurare collaboration patterns nel team
- Identificare collaboration clusters
- Vedere cross-team collaboration
- Tracciare knowledge sharing
- Misurare code review effectiveness

## 🔧 Automation & Tooling

### Automated Checks

#### Linting
- Eseguire linting automatico su codice modificato
- Eseguire ESLint
- Eseguire Prettier check
- Eseguire StyleLint per CSS
- Eseguire HTMLHint per templates
- Verificare auto-fixable issues
- Generare lint report

#### Type Checking
- Eseguire type checking TypeScript
- Eseguire tsc --noEmit
- Verificare type errors
- Controllare strict mode compliance
- Generare type check report

#### Test Execution
- Eseguire test suite completa
- Eseguire unit tests
- Eseguire integration tests
- Eseguire E2E tests
- Calcolare test coverage
- Generare test report

#### Security Scanning
- Eseguire security scans automatici
- Eseguire npm audit
- Eseguire dependency vulnerability scan
- Eseguire SAST (Static Application Security Testing)
- Eseguire secret scanning
- Generare security report

#### Dependency Checking
- Eseguire dependency checks
- Verificare outdated dependencies
- Controllare deprecated dependencies
- Verificare license compliance
- Identificare security vulnerabilities
- Suggerire updates

#### License Compliance
- Eseguire license compliance checks
- Verificare license compatibility
- Identificare license conflicts
- Controllare missing licenses
- Generare license report

#### Code Formatting
- Eseguire code formatting checks
- Verificare Prettier compliance
- Controllare EditorConfig compliance
- Identificare formatting issues
- Auto-format quando possibile

### Code Suggestions

#### Automated Refactoring
- Proporre refactoring automatico
- Suggerire extract method
- Suggerire extract class
- Proporre inline variable
- Suggerire rename for clarity
- Proporre move to appropriate location

#### Optimization Suggestions
- Suggerire ottimizzazioni di performance
- Proporre algorithm improvements
- Suggerire caching opportunities
- Proporre lazy loading
- Suggerire code splitting
- Proporre memoization

#### Common Fixes
- Proporre fix per problemi comuni
- Suggerire type annotations
- Proporre null checks
- Suggerire error handling
- Proporre input validation
- Suggerire accessibility fixes

#### Performance Improvements
- Suggerire miglioramenti di performance
- Proporre operator ottimizzati
- Suggerire pure functions
- Proporre batch operations
- Suggerire debouncing/throttling
- Proporre worker usage

#### Code Simplification
- Proporre semplificazioni
- Suggerire ternary operators
- Proporre optional chaining
- Suggerire nullish coalescing
- Proporre destructuring
- Suggerire arrow functions

#### Duplication Removal
- Suggerire rimozione codice duplicato
- Proporre extract common logic
- Suggerire helper functions
- Proporre utility functions
- Suggerire shared components
- Proporre abstract base classes

## 🎯 Custom Rules & Policies

### Organization Rules

#### Naming Conventions
- Verificare naming conventions specifiche dell'organizzazione
- Controllare class naming
- Verificare method naming
- Controllare variable naming
- Verificare constant naming
- Controllare file naming
- Verificare component naming

#### Architectural Guidelines
- Controllare architectural guidelines aziendali
- Verificare layer architecture
- Controllare module boundaries
- Verificare dependency directions
- Controllare pattern usage
- Verificare framework usage

#### Coding Standards
- Verificare company coding standards
- Controllare code style compliance
- Verificare documentation standards
- Controllare testing standards
- Verificare error handling standards
- Controllare logging standards

#### Security Policies
- Controllare security policies aziendali
- Verificare authentication requirements
- Controllare authorization standards
- Verificare data encryption policies
- Controllare secret management
- Verificare audit logging

#### Compliance Requirements
- Verificare compliance requirements
- Controllare GDPR compliance
- Verificare SOC2 requirements
- Controllare HIPAA compliance
- Verificare PCI-DSS standards
- Controllare industry regulations

#### Brand Guidelines
- Controllare brand guidelines rispettate
- Verificare UI/UX consistency
- Controllare color usage
- Verificare typography
- Controllare logo usage
- Verificare accessibility standards

#### Licensing
- Verificare licensing requirements
- Controllare open source license compliance
- Verificare proprietary code protection
- Controllare third-party licenses
- Verificare license headers in files

### Project-Specific Rules

#### Custom Config Rules
- Applicare regole custom da config file
- Leggere .github/code-review-rules.json
- Verificare project-specific patterns
- Controllare custom validations
- Applicare project conventions

#### Project Patterns
- Verificare project-specific patterns
- Controllare established conventions
- Verificare architecture decisions
- Controllare technology choices
- Verificare framework usage patterns

#### Feature Flags
- Controllare feature flags usage
- Verificare feature flag naming
- Controllare feature flag cleanup
- Verificare feature flag documentation
- Controllare feature toggle implementation

#### Environment-Specific
- Verificare environment-specific code appropriato
- Controllare environment detection
- Verificare configuration management
- Controllare environment variables usage
- Verificare deployment environments

#### Deprecated API
- Controllare deprecated API usage
- Identificare uso di APIs deprecate
- Verificare migration to new APIs
- Controllare deprecation warnings
- Suggerire alternatives

#### Migration Requirements
- Verificare migration requirements per breaking changes
- Controllare migration scripts
- Verificare backward compatibility
- Controllare migration documentation
- Verificare migration testing

## 🌐 Cross-Repository

### Dependencies

#### Breaking Changes
- Verificare breaking changes in dipendenze esterne
- Identificare API changes
- Controllare signature changes
- Verificare behavior changes
- Controllare removed features

#### Version Compatibility
- Controllare version compatibility tra dipendenze
- Verificare peer dependency requirements
- Controllare version ranges
- Identificare version conflicts
- Verificare compatible versions

#### Deprecated Dependencies
- Identificare deprecated dependencies in uso
- Trovare unmaintained packages
- Verificare EOL (End of Life) dependencies
- Suggerire migration paths
- Controllare replacement packages

#### Security Vulnerabilities
- Verificare security vulnerabilities in dipendenze
- Controllare CVE database
- Identificare high severity vulnerabilities
- Verificare patches disponibili
- Suggerire version updates

#### License Compatibility
- Controllare license compatibility tra dependencies
- Verificare license conflicts
- Identificare incompatible licenses
- Controllare copyleft requirements
- Verificare license compliance

#### Alternative Dependencies
- Suggerire alternative a dipendenze problematiche
- Proporre lighter alternatives
- Suggerire better maintained packages
- Proporre modern replacements
- Valutare trade-offs

### Multi-Repo Impact

#### Cross-Repo Impact
- Identificare impatto su altri repository
- Verificare shared libraries changes
- Controllare breaking changes propagation
- Identificare downstream consumers
- Verificare integration points

#### API Contracts
- Verificare API contracts rispettati con altri repos
- Controllare interface compatibility
- Verificare schema changes
- Controllare versioning
- Verificare backward compatibility

#### Backward Compatibility
- Controllare backward compatibility mantenuta
- Verificare breaking changes documented
- Controllare deprecation period
- Verificare migration guides
- Controllare feature flags for breaking changes

#### Downstream Updates
- Suggerire updates in downstream repos
- Identificare repos da aggiornare
- Proporre coordinated releases
- Verificare dependency updates needed
- Tracciare update propagation

#### Shared Library Changes
- Verificare shared library changes impattano consumers
- Controllare public API changes
- Verificare breaking changes
- Controllare versioning strategy
- Suggerire communication plan

## 📚 Learning & Knowledge

### Context Building

#### Codebase Patterns
- Analizzare pattern esistenti nel codebase
- Identificare recurring patterns
- Comprendere design decisions
- Apprendere coding conventions
- Rilevare architectural patterns

#### Historical PRs
- Imparare da PRs precedenti simili
- Vedere come problemi simili risolti
- Analizzare review feedback passato
- Comprendere evolution del codice
- Tracciare decision history

#### Best Practices
- Identificare best practices consolidate nel progetto
- Rilevare patterns di successo
- Comprendere quality standards
- Apprendere team preferences
- Documentare tribal knowledge

#### Architecture Evolution
- Rilevare evoluzioni architetturali nel tempo
- Tracciare major refactorings
- Comprendere architectural decisions
- Analizzare migration paths
- Documentare architecture history

#### Technical Decisions
- Comprendere decisioni tecniche passate
- Analizzare technology choices
- Comprendere trade-offs
- Documentare rationale
- Tracciare ADRs (Architecture Decision Records)

### Knowledge Sharing

#### Architecture Explanation
- Spiegare decisioni architetturali attuali
- Illustrare system design
- Chiarire component interactions
- Documentare data flows
- Spiegare technology stack

#### Historical Context
- Fornire contesto storico per decisioni
- Spiegare perché certi patterns
- Illustrare evolution del codebase
- Chiarire legacy code reasons
- Documentare known limitations

#### Best Practices Sharing
- Condividere best practices con team
- Educare su patterns corretti
- Illustrare anti-patterns da evitare
- Fornire examples
- Linkare a resources

#### Educational Resources
- Linkare a risorse educative rilevanti
- Condividere documentation ufficiale
- Suggerire tutorials
- Linkare a blog posts
- Condividere video tutorials

#### Learning Paths
- Suggerire learning paths per il team
- Proporre skill development
- Raccomandare courses
- Suggerire books rilevanti
- Proporre certification paths

---

**Nota**: Tutte queste capacità sono disponibili tramite combinazione di MCP GitHub access, analisi statica del codice, e integrazione con strumenti di sviluppo esistenti (ESLint, TypeScript, testing frameworks, etc.).
