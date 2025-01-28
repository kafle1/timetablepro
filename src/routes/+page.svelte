<!-- Hero Section -->
<script lang="ts">
  import { ArrowRight, Calendar, Users, School, Bell, BarChart } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Avatar } from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
</script>

<div class="flex flex-col min-h-screen bg-gradient-to-b from-primary-50 to-white">
  <!-- Navigation for Homepage -->
  <header class="w-full border-b bg-white/80 backdrop-blur-sm fixed top-0 z-50">
    <nav class="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" class="text-2xl font-bold text-primary">TimetablePro</a>
      <div class="flex items-center gap-4">
        <a href="/login" class="text-secondary-600 hover:text-primary">Login</a>
        <a href="/register" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors">
          Register
        </a>
      </div>
    </nav>
  </header>

  <!-- Main Content -->
  <main class="flex-1 pt-16">
    <!-- Hero Section -->
    <section class="w-full py-20 md:py-32">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div class="space-y-8">
            <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-950 leading-tight">
              Simplify Scheduling, <span class="text-primary-600">Enhance Productivity!</span>
            </h1>
            <p class="text-lg md:text-xl text-secondary-600">
              Effortlessly manage school timetables with intelligent conflict resolution. Save time and reduce scheduling headaches.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <Button size="lg" class="bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">
                Get Started <ArrowRight class="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" class="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-medium transition-colors">
                Schedule Demo
              </Button>
            </div>
          </div>
          <div class="relative">
            <div class="absolute -inset-4 bg-gradient-to-r from-primary-200/20 to-accent-200/20 rounded-lg blur-3xl" />
            <img
              src="/hero-illustration.svg"
              alt="TimetablePro Illustration"
              class="relative w-full h-auto max-w-[600px] mx-auto"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="w-full py-20 bg-white">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="text-center mb-16">
          <Badge variant="outline" class="mb-4">Features</Badge>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-secondary-950 mb-4">
            Everything you need to manage schedules
          </h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            Powerful features designed to make timetable management effortless and efficient.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {#each [
            {
              icon: Calendar,
              title: 'Intelligent Scheduling',
              description: 'Automatically resolves conflicts and optimizes timetables.'
            },
            {
              icon: Users,
              title: 'Resource Management',
              description: 'Efficiently manage teachers, rooms, and other resources.'
            },
            {
              icon: Bell,
              title: 'Real-Time Updates',
              description: 'Stay informed with instant notifications about changes.'
            },
            {
              icon: BarChart,
              title: 'Detailed Analytics',
              description: 'Track and optimize your scheduling efficiency.'
            }
          ] as feature}
            <Card class="p-6 hover:shadow-lg transition-shadow duration-300 border border-secondary-100">
              <div class="rounded-full bg-primary-100 p-3 w-12 h-12 mb-4 flex items-center justify-center">
                <svelte:component this={feature.icon} class="w-6 h-6 text-primary-600" />
              </div>
              <h3 class="font-display text-xl font-semibold text-secondary-900 mb-2">
                {feature.title}
              </h3>
              <p class="text-secondary-600">
                {feature.description}
              </p>
            </Card>
          {/each}
        </div>
      </div>
    </section>

    <!-- User Roles Section -->
    <section class="w-full py-20 bg-secondary-50">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="text-center mb-16">
          <Badge variant="outline" class="mb-4">For Everyone</Badge>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-secondary-950 mb-4">
            Tailored for every role
          </h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            Whether you're an administrator, teacher, or student, TimetablePro has features designed for you.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {#each [
            {
              icon: School,
              role: 'Administrators',
              description: 'Manage schedules, resolve conflicts, and oversee resources with ease.'
            },
            {
              icon: Users,
              role: 'Teachers',
              description: 'View your schedule, update availability, and stay informed of changes.'
            },
            {
              icon: Calendar,
              role: 'Students',
              description: 'Access your class schedule anytime and receive instant updates.'
            }
          ] as role}
            <Card class="p-8 hover:shadow-lg transition-shadow duration-300 border border-secondary-100">
              <div class="rounded-full bg-accent-100 p-3 w-12 h-12 mb-4 flex items-center justify-center">
                <svelte:component this={role.icon} class="w-6 h-6 text-accent-600" />
              </div>
              <h3 class="font-display text-xl font-semibold text-secondary-900 mb-2">
                {role.role}
              </h3>
              <p class="text-secondary-600 mb-4">
                {role.description}
              </p>
              <Button variant="outline" class="w-full border-secondary-200 hover:bg-secondary-50">
                Learn More <ArrowRight class="ml-2 h-4 w-4" />
              </Button>
            </Card>
          {/each}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="w-full py-20 bg-white">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-12 md:p-20 text-center">
          <h2 class="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to streamline your scheduling process?
          </h2>
          <p class="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of educational institutions that trust TimetablePro for their scheduling needs.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" class="bg-white hover:bg-gray-100 text-primary-600 font-medium transition-colors">
              Get Started <ArrowRight class="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" class="border-2 border-white text-white hover:bg-white/20 font-medium transition-colors">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="w-full py-20 bg-secondary-50">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="text-center mb-16">
          <Badge variant="outline" class="mb-4">Testimonials</Badge>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-secondary-950 mb-4">
            Loved by educators worldwide
          </h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            See what our users have to say about their experience with TimetablePro.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {#each [
            {
              name: 'Sarah Johnson',
              role: 'School Principal',
              avatar: '👩‍🏫',
              quote: 'TimetablePro has revolutionized how we manage our school schedules. The time saved is incredible!'
            },
            {
              name: 'Michael Chen',
              role: 'Department Head',
              avatar: '👨‍🏫',
              quote: 'The conflict resolution feature alone has saved us countless hours of manual scheduling work.'
            },
            {
              name: 'Emily Brown',
              role: 'Teacher',
              avatar: '👩‍🏫',
              quote: 'I love how easy it is to view my schedule and manage my availability. Highly recommended!'
            }
          ] as testimonial}
            <Card class="p-6 hover:shadow-lg transition-shadow duration-300 border border-secondary-100">
              <div class="flex items-center gap-4 mb-4">
                <Avatar>
                  <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-lg">
                    {testimonial.avatar}
                  </div>
                </Avatar>
                <div>
                  <h3 class="font-semibold text-secondary-900">{testimonial.name}</h3>
                  <p class="text-sm text-secondary-600">{testimonial.role}</p>
                </div>
              </div>
              <p class="text-secondary-600 italic">"{testimonial.quote}"</p>
            </Card>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="w-full py-8 bg-white border-t">
    <div class="max-w-[1400px] mx-auto px-6 text-center text-secondary-600">
      © 2024 TimetablePro. All rights reserved.
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .max-w-\[1400px\] {
    width: 100%;
    max-width: 1400px;
  }
</style>
