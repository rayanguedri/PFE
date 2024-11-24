using Application.Core;
using Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class Delete
    {
        
        public class Command : IRequest<Result<Unit>>
        {
            public int CommentId { get; set; }
            public Guid ActivityId { get; set; }
        }

        
        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.CommentId).NotEmpty();
                RuleFor(x => x.ActivityId).NotEmpty();
            }
        }

        
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }

            
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                
                var comment = await _context.Comments
                    .Include(c => c.Author)
                    .FirstOrDefaultAsync(c => c.Id == request.CommentId, cancellationToken);

                if (comment == null)
                {
                    
                    return Result<Unit>.Failure("Comment not found");
                }

                
                var currentUser = await _context.Users
                    .SingleOrDefaultAsync(u => u.UserName == _userAccessor.GetUsername(), cancellationToken);

                
                if (comment.Author.UserName != currentUser.UserName)
                {
                    
                    return Result<Unit>.Failure("You are not authorized to delete this comment");
                }

                
                _context.Comments.Remove(comment);

                
                var success = await _context.SaveChangesAsync(cancellationToken) > 0;

                if (!success)
                {
                    
                    return Result<Unit>.Failure("Failed to delete the comment");
                }

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}
