import { CreateCommentDto } from './create-comment.dto';

describe('CommentCreateDto', () => {
  it('should be defined', () => {
    expect(new CreateCommentDto()).toBeDefined();
  });
});
