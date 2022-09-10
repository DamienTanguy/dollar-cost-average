import { shallowMount } from '@vue/test-utils'
import HomeDescription from '@/components/HomeDescription.vue'

describe('HomeDescription.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HomeDescription, {
      props: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
