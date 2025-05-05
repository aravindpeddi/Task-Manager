using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;

namespace TaskManagerAPI.Services
{
    public class DailyResetService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public DailyResetService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                var nextRunTime = DateTime.Today.AddDays(1); // Midnight of next day
                var delay = nextRunTime - now;

                await Task.Delay(delay, stoppingToken);

                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<TaskDbContext>();

                    var tasks = await context.Tasks.ToListAsync(stoppingToken);
                    foreach (var task in tasks)
                    {
                        task.IsCompleted = false;
                    }

                    await context.SaveChangesAsync(stoppingToken);
                }
            }
        }
    }
}
