import os

file_path = 'src/api/index.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_functions = """
export const getReviews = async (poiId: number) => {
  const response = await api.get(\/reviews/poi/\\);
  return response.data;
};

export const createReview = async (userId: number, poiId: number, rating: number, content: string) => {
  const response = await api.post('/reviews', { userId, poiId, rating, content });
  return response.data;
};
"""

if 'getReviews' not in content:
    content = content.replace('export default api;', new_functions + '\nexport default api;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("API updated")
