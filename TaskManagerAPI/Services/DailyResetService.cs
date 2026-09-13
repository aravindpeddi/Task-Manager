using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TaskManagerAPI.Data;

namespace TaskManagerAPI.Services
{
    public class DailyResetService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DailyResetService> _logger;

        public DailyResetService(
            IServiceProvider serviceProvider,
            ILogger<DailyResetService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "Daily reset service started."
            );

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;

                // Calculate the next midnight
                var nextMidnight = now.Date.AddDays(1);

                var delay = nextMidnight - now;

                _logger.LogInformation(
                    "Next automatic task reset scheduled for {NextMidnight}.",
                    nextMidnight
                );

                try
                {
                    await Task.Delay(
                        delay,
                        stoppingToken
                    );
                }
                catch (OperationCanceledException)
                    when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }

                try
                {
                    await ResetTasksAsync(
                        stoppingToken
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to reset daily tasks."
                    );
                }
            }

            _logger.LogInformation(
                "Daily reset service stopped."
            );
        }

        private async Task ResetTasksAsync(
            CancellationToken stoppingToken)
        {
            using var scope =
                _serviceProvider.CreateScope();

            var context =
                scope.ServiceProvider
                    .GetRequiredService<TaskDbContext>();

            var resetCount =
                await context.Tasks
                    .Where(task => task.IsCompleted)
                    .ExecuteUpdateAsync(
                        setters =>
                            setters.SetProperty(
                                task => task.IsCompleted,
                                false
                            ),
                        stoppingToken
                    );

            _logger.LogInformation(
                "Daily task reset completed. " +
                "{ResetCount} completed tasks were reset.",
                resetCount
            );
        }
    }
}